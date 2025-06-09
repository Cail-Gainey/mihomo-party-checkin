/**
 * ikuuu服务模块
 * 处理与ikuuu网站相关的操作，包括签到和获取订阅
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
import axios from 'axios'

/**
 * ikuuu 签到服务
 * 登录ikuuu网站并执行签到操作
 * @param email 用户邮箱
 * @param password 用户密码
 * @param url ikuuu网站地址
 * @returns 签到结果
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export async function checkin(email: string, password: string, url: string) {
  try {
    // 构建签到请求
    const loginUrl = `${url}/auth/login`
    const checkUrl = `${url}/user/checkin`
    
    // 设置请求头
    const headers = {
      'origin': url,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      'content-type': 'application/x-www-form-urlencoded'
    }
    
    // 创建一个 axios 实例，用于保持会话
    const instance = axios.create({
      headers,
      withCredentials: true
    })
    
    console.log(`[${email}] 正在登录...`)
    
    // 登录请求数据
    const loginData = new URLSearchParams()
    loginData.append('email', email)
    loginData.append('passwd', password)
    
    // 登录
    const loginResponse = await instance.post(loginUrl, loginData, {
      headers: headers
    })
    
    const loginResult = loginResponse.data
    console.log(`登录结果: ${loginResult.msg}`)
    
    if (!loginResult.ret || loginResult.ret !== 1) {
      throw new Error(loginResult.msg || '登录失败')
    }
    
    // 保存登录后的 cookie
    const cookies = loginResponse.headers['set-cookie']
    const cookieHeader = cookies ? cookies.join('; ') : ''
    
    // 执行签到
    console.log('正在签到...')
    const checkResponse = await instance.post(checkUrl, {}, {
      headers: {
        ...headers,
        'Cookie': cookieHeader
      }
    })
    
    const checkResult = checkResponse.data
    console.log(`签到结果: ${JSON.stringify(checkResult)}`)
    
    // 判断签到结果
    if (checkResult.ret === 1) {
      // 签到成功
      return { 
        success: true, 
        message: checkResult.msg || '签到成功' 
      }
    } else if (checkResult.ret === 0 && checkResult.msg && (
      checkResult.msg.includes('已经签到') || 
      checkResult.msg.includes('已签到')
    )) {
      // 已经签到过
      return { 
        success: true, 
        message: checkResult.msg 
      }
    } else {
      // 签到失败
      throw new Error(checkResult.msg || '签到失败')
    }
  } catch (error) {
    console.error('ikuuu 签到出错:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '签到失败'
    }
  }
}

/**
 * 获取 ikuuu 订阅链接
 * 登录 ikuuu 并从用户页面获取 Clash 订阅链接
 * @param email 用户邮箱
 * @param password 用户密码
 * @param url ikuuu网站地址
 * @returns 订阅链接获取结果
 * @author Cail Gainey <cailgainey@foxmail.com>
 */
export async function getSubscription(email: string, password: string, url: string) {
  try {
    // 构建请求
    const loginUrl = `${url}/auth/login`
    const userUrl = `${url}/user`
    
    // 设置请求头
    const headers = {
      'origin': url,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      'content-type': 'application/x-www-form-urlencoded'
    }
    
    // 创建一个 axios 实例，用于保持会话
    const instance = axios.create({
      headers,
      withCredentials: true
    })
    
    console.log(`[${email}] 正在登录以获取订阅...`)
    
    // 登录请求数据
    const loginData = new URLSearchParams()
    loginData.append('email', email)
    loginData.append('passwd', password)
    
    // 登录
    const loginResponse = await instance.post(loginUrl, loginData, {
      headers: headers
    })
    
    const loginResult = loginResponse.data
    console.log(`登录结果: ${loginResult.msg}`)
    
    if (!loginResult.ret || loginResult.ret !== 1) {
      throw new Error(loginResult.msg || '登录失败')
    }
    
    // 保存登录后的 cookie
    const cookies = loginResponse.headers['set-cookie']
    const cookieHeader = cookies ? cookies.join('; ') : ''
    
    // 获取用户页面
    console.log('正在获取用户页面...')
    const userResponse = await instance.get(userUrl, {
      headers: {
        ...headers,
        'Cookie': cookieHeader
      }
    })
    
    // 解析页面内容，查找 Clash 订阅链接
    const htmlContent = userResponse.data
    
    // 使用正则表达式匹配 Clash 订阅链接
    const clashLinkRegex = /data-clipboard-text="(https:\/\/[^"]+\?clash=\d+[^"]+)"/i
    const match = htmlContent.match(clashLinkRegex)
    
    if (match && match[1]) {
      const subscriptionUrl = match[1]
      return { 
        success: true, 
        subscriptionUrl
      }
    } else {
      throw new Error('无法找到 Clash 订阅链接')
    }
  } catch (error) {
    console.error('获取 ikuuu 订阅链接出错:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '获取订阅链接失败'
    }
  }
} 