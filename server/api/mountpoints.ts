// server/api/mountpoints.ts
import { defineEventHandler, readBody, getMethod, createError } from 'h3'

interface Mountpoint {
  id: number
  description: string
  roomId?: number
  publisherId?: number
  createdAt: string
}

// In-memory storage
let mountpoints: Mountpoint[] = []
let nextId = 1

export default defineEventHandler(async (event) => {
  const method = getMethod(event)

  try {
    if (method === 'GET') {
      // Return all mountpoints
      return {
        success: true,
        data: mountpoints,
        count: mountpoints.length
      }
    }

    if (method === 'POST') {
      // Create a new mountpoint
      const body = await readBody(event)
      
      if (!body.description) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Description is required'
        })
      }

      const newMountpoint: Mountpoint = {
        id: nextId++,
        description: body.description,
        roomId: body.roomId || null,
        publisherId: body.publisherId || null,
        createdAt: new Date().toISOString()
      }

      mountpoints.push(newMountpoint)
      
      console.log(`Created mountpoint: ${newMountpoint.description} (ID: ${newMountpoint.id})`)
      
      return {
        success: true,
        data: newMountpoint
      }
    }

    if (method === 'DELETE') {
      // Delete a mountpoint by ID from URL
      const url = new URL(event.node.req.url || '', `http://localhost`)
      const id = parseInt(url.searchParams.get('id') || '')
      
      if (!id || isNaN(id)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Valid mountpoint ID is required'
        })
      }

      const index = mountpoints.findIndex(mp => mp.id === id)
      if (index === -1) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Mountpoint not found'
        })
      }

      const deleted = mountpoints.splice(index, 1)[0]
      console.log(`Deleted mountpoint: ${deleted.description}`)
      
      return {
        success: true,
        data: deleted
      }
    }

    throw createError({
      statusCode: 405,
      statusMessage: 'Method not allowed'
    })
  } catch (error) {
    console.error('Mountpoints API error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})