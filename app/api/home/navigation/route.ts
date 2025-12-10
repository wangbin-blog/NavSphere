import { NextResponse } from 'next/server'
import { getNavigationData } from '@/lib/github'
import { NavigationData } from '@/types/navigation'

export const runtime = 'edge'

export async function GET() {
  try {
    let navigationData= await getNavigationData('navsphere/content/navigation.json')
        batchProcessIcons(navigationData);

    return NextResponse.json(navigationData, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate',
        'Content-Type': 'application/json'
      }
    })
  } catch (error) {
    console.error('Error in navigation API:', error)
    return NextResponse.json(
      { error: '获取导航数据失败' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
}

function processIconPath(iconPath: string|undefined): string {
  if (!iconPath) {
    return ''
  }
  // 如果 icon 路径以 / 开头，则拼接域名；否则保持原样
  if (iconPath.startsWith('/')) {
    const owner = process.env.GITHUB_OWNER 
    const repo = process.env.GITHUB_REPO
    const url_proxy = process.env.URL_PROXY 
    const branch = process.env.GITHUB_BRANCH 
    iconPath = `${url_proxy}/https://github.com/${owner}/${repo}/blob/${branch}/public${iconPath}`
  }
  return iconPath;
}

/**
 * 递归处理所有 icon 路径
 * @param data 要处理的导航数据
 * @param baseDomain 基础域名
 */
function batchProcessIcons(data: NavigationData): void {
  // 处理一级导航项的 icon
  data.navigationItems.forEach(item => {
    item.icon = processIconPath(item.icon);
    
    // 处理子分类的 icon
    item.subCategories?.forEach(subCat => {
      subCat.icon = processIconPath(subCat.icon);
      
      // 处理子分类下的 items 的 icon
      subCat.items?.forEach(subItem => {
        subItem.icon = processIconPath(subItem.icon);
      });
    });
    
    // 处理一级导航项直接的 items 的 icon（以防有数据）
    item.items?.forEach(topItem => {
      topItem.icon = processIconPath(topItem.icon);
    });
  });
}
