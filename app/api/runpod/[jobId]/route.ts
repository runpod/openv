import { NextResponse } from 'next/server'
import runpodSdk from 'runpod-sdk'

export function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const API_KEY = process.env.RUNPOD_API_KEY
  const ENDPOINT_ID = process.env.RUNPOD_ENDPOINT_ID

  if (!API_KEY || !ENDPOINT_ID) {
    return NextResponse.json({ error: 'RunPod configuration is missing' }, { status: 500 })
  }

  const { jobId } = params

  try {
    const runpod = runpodSdk(API_KEY)
    const endpoint = runpod.endpoint(ENDPOINT_ID)

    if (!endpoint) {
      return NextResponse.json({ error: 'Failed to connect to RunPod endpoint' }, { status: 500 })
    }

    return endpoint.status(jobId).then(status => {
      return NextResponse.json(status)
    }).catch(error => {
      console.error('Error fetching RunPod job status:', error)
      return NextResponse.json({ error: 'Failed to fetch RunPod job status' }, { status: 500 })
    })
  } catch (error) {
    console.error('Error initializing RunPod:', error)
    return NextResponse.json({ error: 'Failed to initialize RunPod' }, { status: 500 })
  }
}

