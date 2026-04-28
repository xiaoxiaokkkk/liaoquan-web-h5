<template>
  <div class="agreement-page">
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
    <!-- <Navbar title="用户协议" left="left" right="" backgroundColor="transparent" /> -->
    <div class="agreement-content">
      <div class="agreement-title">料圈商城用户协议</div>
      
      <!-- 1. 协议主体与效力 -->
      <div class="agreement-section">
        <div class="section-title">1. 协议主体与效力</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">1.1</div>
            <div class="item-text">本协议由【料圈商城】（以下简称"平台"）与使用平台服务的用户（包括普通用户、门店用户、代理用户，以下统称"用户"）共同订立，具有法律效力。</div>
          </div>
          <div class="section-item">
            <div class="item-number">1.2</div>
            <div class="item-text">用户注册、登录、使用平台服务或参与平台活动，即视为已充分阅读、理解并同意本协议全部条款。若用户不同意本协议，应立即停止使用平台服务。</div>
          </div>
          <div class="section-item">
            <div class="item-number">1.3</div>
            <div class="item-text">平台有权根据业务发展需要修订本协议，修订后将通过平台站内信、公告等显著方式通知用户。用户继续使用平台服务的，视为同意修订后的协议；若不同意，可终止使用平台服务。</div>
          </div>
        </div>
      </div>

      <!-- 2. 账号注册与管理 -->
      <div class="agreement-section">
        <div class="section-title">2. 账号注册与管理</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">2.1</div>
            <div class="item-text">注册资格</div>
            <div class="item-list">
              <div class="list-item">2.1.1 普通用户：应为具有完全民事行为能力的自然人，通过手机号+验证码登录完成注册。</div>
              <div class="list-item">2.1.2 门店用户：应为依法设立的个体工商户或企业法人，提交营业执照、负责人身份证明等真实有效资质材料，经平台审核通过后完成注册。</div>
              <div class="list-item">2.1.3 代理用户：应为依法设立的企业法人或其他组织，提交营业执照、区域授权证明等真实有效资质材料，经平台审核通过并明确负责区域后完成注册。</div>
            </div>
          </div>
          <div class="section-item">
            <div class="item-number">2.2</div>
            <div class="item-text">账号责任</div>
            <div class="item-list">
              <div class="list-item">2.2.1 用户应妥善保管账号及密码，对账号下的所有操作行为承担法律责任。若账号被盗用，应立即通知平台冻结账号，平台将协助核查处理，但不承担账号被盗用导致的直接或间接损失。</div>
              <div class="list-item">2.2.2 用户不得出租、出借、转让账号，否则应承担由此产生的全部法律责任，平台有权视情节冻结或注销账号。</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 核心业务规则 -->
      <div class="agreement-section">
        <div class="section-title">3. 核心业务规则</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">3.1</div>
            <div class="item-text">会员积分规则</div>
            <div class="item-list">
              <div class="list-item">3.1.1 定义：会员积分是平台向用户发放的内部增值凭证，仅用于平台内商品购买或文创纪念品兑换，不具有货币属性，不得转让、提现或用于其他非平台指定用途，其相关权益由平台解释。</div>
              <div class="list-item">3.1.2 获取方式：用户通过支付宝、微信直接支付购物时，按1:1比例获得积分；平台可根据运营活动向注册用户、活动参与者赠送积分，具体规则以活动公告为准。</div>
              <div class="list-item">3.1.3 使用规则：积分可单独支付购物，使用积分消费不触发推荐人、门店及代理的分享补贴分配；积分默认有效期365天，过期后将清0。将提前7天通过站内信通知。</div>
            </div>
          </div>
          <div class="section-item">
            <div class="item-number">3.2</div>
            <div class="item-text">分享补贴规则</div>
            <div class="item-list">
              <div class="list-item">3.2.1 定义：分享补贴是平台根据用户消费、推荐行为及门店/代理运营成果发放的可提现权益凭证，仅门店用户、代理用户及完成推荐的普通用户可获取。</div>
              <div class="list-item">3.2.2 获取条件：</div>
              <div class="list-item">• 用户消费触发：普通用户现金支付购物时，对应门店按消费金额[5]%、对应代理按[3]%获得补贴；</div>
              <div class="list-item">• 推荐触发：普通用户通过专属链接/二维码推荐新用户现金消费的，推荐人按消费金额[10]%获得补贴；门店通过专属链接推荐新用户现金消费的，门店按[5]%、对应代理按[3]%获得补贴；</div>
              <div class="list-item">• 补贴仅针对直接推荐行为，无间接推荐收益，推荐关系自被推荐人首次注册消费后永久有效且不可变更。</div>
              <div class="list-item">3.2.3 提现规则：补贴按1:1比例提现，单笔最低100元，最高[10000]元，手续费10%，到账时间为T+1工作日；补贴需经7天待入账期（自商品收货之日起算），到期后自动转为可提现状态。</div>
            </div>
          </div>
          <div class="section-item">
            <div class="item-number">3.3</div>
            <div class="item-text">交易与兑换规则</div>
            <div class="item-list">
              <div class="list-item">3.3.1 用户购物时应仔细核对订单信息，提交订单并完成支付后，视为与平台建立买卖合同关系，平台将按订单信息发货。</div>
              <div class="list-item">3.3.2 会员积分兑换文创纪念品的，用户确认兑换即扣除相应积分，兑换后不支持撤销或退回积分。</div>
              <div class="list-item">3.3.3 平台商品价格、库存等信息可能调整，以结算时页面显示为准，若因系统故障或不可抗力导致价格错误，平台有权撤销订单并退还已付款项。</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 4. 各方权利义务 -->
      <div class="agreement-section">
        <div class="section-title">4. 各方权利义务</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">4.1</div>
            <div class="item-text">用户权利义务</div>
            <div class="item-list">
              <div class="list-item">4.1.1 权利：享受平台提供的购物、积分兑换、推荐收益等服务；查询账号资产明细、订单记录；对个人信息行使查询、更正、删除等权利。</div>
              <div class="list-item">4.1.2 义务：提供真实、准确的注册信息；遵守法律法规及平台规则，不得从事欺诈、盗刷、传销等违法违规行为；不得发布虚假信息或侵犯他人知识产权的内容。</div>
            </div>
          </div>
          <div class="section-item">
            <div class="item-number">4.2</div>
            <div class="item-text">门店/代理额外义务</div>
            <div class="item-list">
              <div class="list-item">4.2.1 门店应妥善维护平台形象，规范推广专属链接，不得误导消费者；代理应履行区域运营职责，监督下属门店合规经营。</div>
              <div class="list-item">4.2.2 门店/代理应及时更新资质信息，确保资质有效；提现时需提交实名认证材料及合法收款账户，若提供虚假信息，平台有权冻结补贴并终止合作。</div>
            </div>
          </div>
          <div class="section-item">
            <div class="item-number">4.3</div>
            <div class="item-text">平台权利义务</div>
            <div class="item-list">
              <div class="list-item">4.3.1 权利：审核用户注册资质；制定并调整积分、补贴规则（需提前公示）；对违规账号采取冻结、注销等管理措施；监督交易行为，处理违规交易。</div>
              <div class="list-item">4.3.2 义务：保障平台系统稳定运行；提供商品信息查询、订单跟踪、客服咨询等服务；保护用户个人信息安全；按规则精准结算积分与补贴。</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. 违约责任 -->
      <div class="agreement-section">
        <div class="section-title">5. 违约责任</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">5.1</div>
            <div class="item-text">用户违反本协议约定（如提供虚假信息、盗用账号、违规提现等），平台有权暂停提供服务、冻结账号资产，由此造成的损失由用户自行承担；情节严重的，平台有权终止协议并追究法律责任。</div>
          </div>
          <div class="section-item">
            <div class="item-number">5.2</div>
            <div class="item-text">平台违反本协议约定（如未按规则发放积分/补贴、泄露用户个人信息等），应承担相应赔偿责任，但因不可抗力、用户自身过错或第三方原因导致的违约除外。</div>
          </div>
        </div>
      </div>

      <!-- 6. 争议解决与其他 -->
      <div class="agreement-section">
        <div class="section-title">6. 争议解决与其他</div>
        <div class="section-content">
          <div class="section-item">
            <div class="item-number">6.1</div>
            <div class="item-text">因本协议产生的争议，双方应协商解决；协商不成的，提交平台所在地有管辖权的人民法院诉讼解决。</div>
          </div>
          <div class="section-item">
            <div class="item-number">6.2</div>
            <div class="item-text">本协议未尽事宜，适用《民法典》《电子商务法》等相关法律法规规定；平台发布的规则、公告等为本协议补充内容，与本协议具有同等效力。</div>
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
@import './agreement.scss';
</style>

