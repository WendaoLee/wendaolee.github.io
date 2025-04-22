import dotenv from 'dotenv';

/**
 * 传入环境变量值，如果环境变量未定义，则及时抛出错误。
 * @param envVal 
 * @param envName 
 * @returns 
 */
export const throwErrorIsEnvNotConfigured = (envVal:string | undefined,envName?:string) => {
    if(!envVal) {
        throw new Error(`${envName} 未配置`)
    }
    return envVal as typeof envVal
}


dotenv.config()

export const ZILLIZ_API_KEY = throwErrorIsEnvNotConfigured(process.env.ZILLIZ_API_KEY,'ZILLIZ_API_KEY')
export const ZILLIZ_ENDPOINT = throwErrorIsEnvNotConfigured(process.env.ZILLIZ_ENDPOINT,'ZILLIZ_ENDPOINT')

export const GENIMI_API_KEY = throwErrorIsEnvNotConfigured(process.env.GENIMI_API_KEY,'GENIMI_API_KEY')
export const PROXY_URL = process.env.PROXY_URL || ''
