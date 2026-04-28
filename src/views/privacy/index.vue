<template>
  <div class="privacy-page">
    <nut-noticebar :left-icon="false" :scrollable="false" background="#4979f2" color="#fff">
      <template #left-icon>
      </template>
      <span>下载APP，应用商店搜索：</span>
      <template #right-icon>
        <img src="@/assets/images/logo.png" alt="logo" style="width: 20px; height: 20px">
        <span style="margin-left: 5px; margin-right: 10px;">特有料</span>
        <nut-button size="mini" color="#F9505B" @click="$router.push('/downloadapp')">下载</nut-button>
      </template>
    </nut-noticebar>
    <!-- <Navbar title="隐私政策" left="left" right="" backgroundColor="transparent" /> -->
    <div class="privacy-content">
      <div class="privacy-title">料圈商城隐私政策</div>
      
      <!-- 1. 总则 -->
      <div class="privacy-section">
        <div class="section-title">1. 总则</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">1.1</div>
            <div class="item-text">本隐私政策旨在明确平台收集、使用、存储、保护用户个人信息的规则，保障用户个人信息权益，依据《个人信息保护法》等法律法规制定。</div>
          </div>
          <div class="section-item">
            <div class="item-number">1.2</div>
            <div class="item-text">用户使用平台服务，即视为同意平台按本政策处理其个人信息；若用户不同意，应停止使用平台服务。平台将根据业务调整及时更新本政策，更新后通过显著方式通知用户。</div>
          </div>
        </div>
      </div>

      <!-- 2. 个人信息收集范围与目的 -->
      <div class="privacy-section">
        <div class="section-title">2. 个人信息收集范围与目的</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">2.1</div>
            <div class="item-text">普通用户个人信息</div>
            <div class="item-list">
              <div class="list-item">• 身份信息：手机号（用于注册登录、验证码验证）、微信/支付宝头像及昵称（第三方登录时获取，用于账号展示）；</div>
              <div class="list-item">• 交易信息：消费记录、订单信息、支付信息（与支付机构共享，用于完成交易结算）、收货地址（用于商品配送）；</div>
              <div class="list-item">• 行为信息：推荐关系记录、积分兑换记录、商品浏览记录（用于发放推荐补贴、提供个性化服务及运营分析）；</div>
              <div class="list-item">• 设备信息：设备型号、IP地址、登录时间（用于账号安全防护、异常交易监控）。</div>
            </div>
          </div>
          <div class="section-item">
            <div class="item-number">2.2</div>
            <div class="item-text">门店/代理用户额外信息</div>
            <div class="item-text">门店/代理用户需额外提供营业执照、负责人/法定代表人身份证明、区域授权证明、银行账户信息（用于资质审核、合作管理及补贴提现）。</div>
          </div>
        </div>
      </div>

      <!-- 3. 个人信息处理规则 -->
      <div class="privacy-section">
        <div class="section-title">3. 个人信息处理规则</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">3.1</div>
            <div class="item-text">收集规则：平台仅收集实现服务目的所必需的个人信息，遵循"最小必要"原则；超出必要范围收集信息的，将单独获得用户同意。</div>
          </div>
          <div class="section-item">
            <div class="item-number">3.2</div>
            <div class="item-text">使用规则：平台将个人信息用于注册登录、交易结算、积分与补贴发放、订单配送、客服咨询、安全防护及运营优化等场景；未经用户单独同意，不将个人信息用于其他目的。</div>
          </div>
          <div class="section-item">
            <div class="item-number">3.3</div>
            <div class="item-text">共享规则：平台不向第三方出售、出租用户个人信息；因业务需要与第三方（支付机构、物流服务商、资质审核机构）共享信息的，将明确共享范围并要求第三方履行保密义务，且共享前获得用户同意（法律法规另有规定的除外）。</div>
          </div>
          <div class="section-item">
            <div class="item-number">3.4</div>
            <div class="item-text">存储规则：个人信息存储于中国境内服务器，存储期限为实现服务目的所必需的最短时间（如交易记录保存至交易完成后5年，资质信息保存至合作终止后5年）；超出保存期限的，将自动删除或匿名化处理。</div>
          </div>
        </div>
      </div>

      <!-- 4. 个人信息安全保障 -->
      <div class="privacy-section">
        <div class="section-title">4. 个人信息安全保障</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">4.1</div>
            <div class="item-text">平台采用加密存储、访问权限控制、安全审计等技术措施，保障个人信息安全，防止信息泄露、篡改或丢失。</div>
          </div>
          <div class="section-item">
            <div class="item-number">4.2</div>
            <div class="item-text">平台建立安全管理制度，明确信息处理流程及人员职责，定期开展安全检测与应急演练；发生个人信息泄露时，将立即采取补救措施并按规定通知用户及监管部门。</div>
          </div>
        </div>
      </div>

      <!-- 5. 用户权利行使 -->
      <div class="privacy-section">
        <div class="section-title">5. 用户权利行使</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">5.1</div>
            <div class="item-text">用户有权查询、更正、补充其个人信息，申请删除不必要的个人信息；有权撤回对个人信息处理的同意（撤回同意不影响撤回前已完成的信息处理效力）。</div>
          </div>
          <div class="section-item">
            <div class="item-number">5.2</div>
            <div class="item-text">用户行使上述权利的，可通过平台"个人中心-隐私设置"提交申请，或联系客服办理；平台将在15个工作日内响应并处理。</div>
          </div>
          <div class="section-item">
            <div class="item-number">5.3</div>
            <div class="item-text">用户有权注销平台账号，账号注销后，平台将删除或匿名化处理其个人信息（法律法规要求留存的除外）。</div>
          </div>
        </div>
      </div>

      <!-- 6. 第三方服务说明 -->
      <div class="privacy-section">
        <div class="section-title">6. 第三方服务说明</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-text">平台服务可能包含第三方链接或插件（如微信/支付宝支付、物流查询插件），第三方服务的隐私政策由第三方制定，平台不承担第三方处理用户个人信息的责任，建议用户查看第三方隐私政策。</div>
          </div>
        </div>
      </div>

      <!-- 7. 联系方式 -->
      <div class="privacy-section">
        <div class="section-title">7. 联系方式</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-text">用户对本隐私政策有疑问或需要维权的，可通过以下方式联系平台：</div>
            <div class="contact-info">
              <div class="contact-item">客服电话：【平台客服电话】</div>
              <div class="contact-item">联系地址：【平台注册地址】</div>
              <div class="contact-item">电子邮箱：【平台官方邮箱】</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
</script>

<style scoped lang="scss">
@import './privacy.scss';
</style>


