import { checkUserBlackStatus } from '@/api/user'
import { useUserStore } from '@/stores/user'

export async function runUserBlackCheck() {
  const userStore = useUserStore()
  const userid = userStore?.userInfo?.userid
  if (!userid) return false

  try {
    const res = await checkUserBlackStatus(userid)
    const code = Number(res?.code)
    if (code === 401 || code === 406) {
      userStore.logout()
      return true
    }
  } catch (error) {
    console.error('用户封禁检测失败:', error)
  }

  return false
}
