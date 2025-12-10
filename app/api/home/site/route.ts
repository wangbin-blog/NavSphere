import { NextResponse } from 'next/server'
import { getNavigationData } from '@/lib/github'

export const runtime = 'edge'

export async function GET() {
  try {
    let siteData= await getNavigationData('navsphere/content/site.json')
    return NextResponse.json(siteData)
  } catch (error) {
    console.error('Error in site API:', error)
    return NextResponse.json(
      { error: '获取站点数据失败' },
      { status: 500 }
    )
  }
}
