# 微信点金计划对接说明（后端）

## 正确流程（与你的描述一致）

1. 服务商平台配置商家小票链接：`https://你的域名/goldPlanReceipt.html`
2. 用户 JSAPI 支付成功后，微信自动打开该页面
3. 微信会在 URL 上携带 3 个参数：
   - `sub_mch_id`
   - `out_trade_no`
   - `check_code`
4. 小票页面用这 3 个参数请求后端接口，获取订单展示信息与 `jumpOutUrl`
5. 小票页面先回传 `onIframeReady`
6. 用户点击“返回商家”按钮后，小票页面回传 `jumpOut`（带 `jumpOutUrl`）跳回 H5

## 前端现状

- 已有静态小票页：`/goldPlanReceipt.html`（`public/goldPlanReceipt.html`）
- 已实现读取 `sub_mch_id/out_trade_no/check_code`
- 已实现调用后端接口：`GET /app/api/pay/v2/gold-plan/receipt-context`
- 已实现 `onIframeReady`、`jumpOut` 两个 JSAPI
- 不再依赖 `payReturnPath/payReturnScene`

说明：

- 此页为原生 HTML + JS，不依赖 Vue 路由、Pinia、Axios、登录守卫。
- 适合点金计划要求的 HTTPS 独立链接场景。

## 后端必须提供的接口

### 1) 小票上下文查询（核心）

- `GET /app/api/pay/v2/gold-plan/receipt-context`

请求参数：

- `sub_mch_id`
- `out_trade_no`
- `check_code`

后端处理：

1. 根据 `out_trade_no` 查订单
2. 查到 `transaction_id`
3. 按点金计划规则计算并校验 `check_code`
4. 校验通过后返回小票页面数据和 `jumpOutUrl`

成功响应示例：

```json
{
  "code": "0",
  "message": "ok",
  "data": {
    "displayStyle": "SHOW_CUSTOM_PAGE",
    "outTradeNo": "202603260001",
    "amount": "19.90",
    "payTime": "2026-03-26 12:30:22",
    "orderTitle": "文章付费",
    "iframeHeight": 700,
    "jumpOutUrl": "https://h5.example.com/contentDetail?contentId=1001&from=gold_plan&outTradeNo=202603260001"
  }
}
```

失败响应示例：

```json
{
  "code": "1001",
  "message": "check_code invalid",
  "data": {
    "displayStyle": "SHOW_OFFICIAL_PAGE",
    "errorMessage": "订单校验失败"
  }
}
```

### 2) `jumpOutUrl` 回到 contentDetail 的方式

后端根据订单业务信息直接生成完整 URL（推荐）：

- `https://h5.example.com/contentDetail?contentId=1001&from=gold_plan&outTradeNo=202603260001`

说明：

- `contentId` 来自你们订单业务字段（下单时本来就有）
- 小票页不拼业务参数，只消费后端返回的 `jumpOutUrl`
- 这样最稳，也符合你说的“后端只用三参数查单”的链路

## 安全与体验要求

- `onIframeReady` 3 秒内必须响应
- `jumpOut` 必须由用户点击触发，不能自动触发
- 小票接口建议免登录（或支持短期签名），避免 iframe 里 401 跳登录
- `jumpOutUrl` 必须走你们域名白名单，禁止外链

## 联调清单

- 支付成功后确实进入 `/goldPlanReceipt?...` 页面
- 3 个参数齐全时可查到订单并展示商家小票
- 点击按钮后通过 `jumpOut` 回到 `contentDetail`
- 校验失败时展示官方小票（`SHOW_OFFICIAL_PAGE`）

