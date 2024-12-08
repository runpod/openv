import { NextResponse } from 'next/server'
import runpodSdk from 'runpod-sdk'

export async function POST(request: Request) {
  const API_KEY = process.env.RUNPOD_API_KEY
  const ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID

  if (!API_KEY || !ENDPOINT_ID) {
    return NextResponse.json({ error: 'RunPod configuration is missing' }, { status: 500 })
  }

  try {
    const runpod = runpodSdk(API_KEY)
    const endpoint = runpod.endpoint(ENDPOINT_ID)

    if (!endpoint) {
      return NextResponse.json({ error: 'Failed to connect to RunPod endpoint' }, { status: 500 })
    }

    const body = await request.json()
    const { input } = body

    console.log('RunPod Input:', input)

    const result = await endpoint.run({ input })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error submitting RunPod job:', error)
    return NextResponse.json({ error: 'Failed to submit RunPod job' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const API_KEY = process.env.RUNPOD_API_KEY
  const ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID

  if (!API_KEY || !ENDPOINT_ID) {
    return NextResponse.json({ error: 'RunPod configuration is missing' }, { status: 500 })
  }

  try {
    const runpod = runpodSdk(API_KEY)
    const endpoint = runpod.endpoint(ENDPOINT_ID)

    if (!endpoint) {
      return NextResponse.json({ error: 'Failed to connet to RunPod endpoint' }, { status: 500 })
    }

    const health = await endpoint.health()
    console.log('RunPod Health Status:', health)
    return NextResponse.json(health)
  } catch (error) {
    console.error('Error fetching RunPod health:', error)
    return NextResponse.json({ error: 'Failed to fetch RunPod health' }, { status: 500 })
  }
}

