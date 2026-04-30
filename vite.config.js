// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import legacy from '@vitejs/plugin-legacy'
import path from 'path'
import postcsspxtoviewport8plugin from 'postcss-px-to-viewport-8-plugin';

// import Components from 'unplugin-vue-components/vite'
// import NutUIResolver from '@nutui/auto-import-resolver'
function resolve( dir ) {
  return path.join( __dirname, dir )
}
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量（根据 mode 加载对应的 .env 文件）
  // 例如：mode='release' 会加载 .env.release
  const env = loadEnv(mode, process.cwd(), '')
  // 构建版本号用于打散微信内置浏览器等环境的静态资源缓存。
  // 可通过 BUILD_VERSION=20260430 npm run build 指定；不指定时每次构建自动使用时间戳。
  const rawBuildVersion = process.env.BUILD_VERSION || env.VITE_BUILD_VERSION || String(Date.now())
  const buildVersion = String(rawBuildVersion).replace(/[^a-zA-Z0-9_-]/g, '') || String(Date.now())
  
  // 设置基础路径，支持通过环境变量 VITE_BASE_PATH 配置
  // 例如：VITE_BASE_PATH=/h5/ 或 VITE_BASE_PATH=/liaoquan/
  // 如果不设置环境变量，默认为 '/'（根路径）
  // 统一规范化：确保 base 形如 '/' 或 '/webh5/'（前后都有 /）
  const rawBasePath = env.VITE_BASE_PATH || '/'
  const basePath =
    rawBasePath === '/'
      ? '/'
      : `/${String(rawBasePath).replace(/^\/+|\/+$/g, '')}/`
  
  return {
  base: basePath,
  plugins: [
    vue(),
    legacy({
      // 兼容较老的 Android WebView / 微信内置浏览器
      targets: ['chrome >= 49', 'safari >= 10', 'ios >= 10', 'android >= 5'],
      // 为老浏览器自动按需注入必要 polyfills
      modernPolyfills: true
    }),
    // 开启 unplugin 插件，自动引入 NutUI 组件
    // Components({
    //   resolvers: [NutUIResolver()],
    // }),
  ],
  resolve : {
    alias : {
      '@' : resolve( 'src' )
    },
    extensions : ['.js', '.json', '.ts', '.vue']
  },
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 3000, // 开发服务器端口
    open: false, // 是否自动打开浏览器
    cors: true, // 启用 CORS
    // 代理配置
    proxy: {
      // 解决下载跨域图片（二维码）时的 CORS 问题：通过同源代理转发到 CDN
      // 前端使用 `/__cdn__` 前缀访问即可，例如：`/__cdn__/lq/xxx/xxx.jpg`
      '/__cdn__': {
        target: 'https://cdn.hnstylor.cn',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/__cdn__/, ''),
      },
      '/chatserver': {
        // target: 'http://localhost:8082', // 后端服务地址，根据实际情况修改
        target: 'http://t.hainanjunfeng.com',
        changeOrigin: true, // 是否改变请求源
        // secure: false, // 如果是 https 接口，需要配置这个参数
        // rewrite: (path) => path.replace(/^\/mobilem-api/, ''), // 重写路径，去掉 /mobilem-api 前缀
        // // 或者保留 /api 前缀，根据后端接口路径决定
        // // rewrite: (path) => path,
        // configure: (proxy, options) => {
        //   proxy.on('error', (err, req, res) => {
        //     console.log('proxy error', err);
        //   });
        //   proxy.on('proxyReq', (proxyReq, req, res) => {
        //     console.log('Sending Request to the Target:', req.method, req.url);
        //   });
        //   proxy.on('proxyRes', (proxyRes, req, res) => {
        //     console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
        //   });
        // },
      },
      // 可以配置多个代理
      // '/api2': {
      //   target: 'http://localhost:8081',
      //   changeOrigin: true,
      //   secure: false,
      //   rewrite: (path) => path.replace(/^\/api2/, ''),
      // },
    }
  },
  css: {
    postcss: {
      plugins: [
        postcsspxtoviewport8plugin({
          unitToConvert: 'px',
          // viewportWidth: file => {
          //   let num = 750;
          //   //van是375
          //   if (file.indexOf('van')>0) {
          //     num = 375;
          //   }
          //   return num;
          // },
          viewportWidth: 375,
          unitPrecision: 5, // 单位转换后保留的精度
          propList: ['*'], // 能转化为vw的属性列表
          viewportUnit: 'vw', // 希望使用的视口单位
          fontViewportUnit: 'vw', // 字体使用的视口单位
          selectorBlackList: ['ignore-'], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
          minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
          mediaQuery: true, // 媒体查询里的单位是否需要转换单位
          replace: true, //  是否直接更换属性值，而不添加备用属性
          exclude: [], // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
          include: [], // 如果设置了include，那将只有匹配到的文件才会被转换
          landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
          landscapeUnit: 'vw', // 横屏时使用的单位
          landscapeWidth: 1628, // 横屏时使用的视口宽度
        }),
      ]
    },
    preprocessorOptions: {
      scss: {
        // 默认京东 APP 10.0主题 > @import "@nutui/nutui/dist/styles/variables.scss";
        // 京东科技主题 > @import "@nutui/nutui/dist/styles/variables-jdt.scss";
        // 京东B商城主题 > @import "@nutui/nutui/dist/styles/variables-jdb.scss";
        // 京东企业业务主题 > @import "@nutui/nutui/dist/styles/variables-jddkh.scss";
        additionalData: (content) => {
          const customThemePath = path.resolve(__dirname, 'src/assets/css/custom_theme.scss').replace(/\\/g, '/')
          return `@import "@nutui/nutui/dist/styles/variables-jdt.scss";\n@import "${customThemePath}";\n${content}`
        }
      }
    }
  },
  // 构建配置
  build: {
    target: 'es2015', // 构建目标
    outDir: 'dist', // 输出目录
    assetsDir: 'assets', // 静态资源目录
    sourcemap: false, // 生产环境不生成 sourcemap
    minify: 'esbuild', // 使用 esbuild 压缩（Vite 默认，性能更好）
    // 如果需要使用 terser，需要先安装: npm install -D terser
    // minify: 'terser',
    // terserOptions: {
    //   compress: {
    //     drop_console: true, // 生产环境移除 console
    //     drop_debugger: true, // 移除 debugger
    //   },
    // },
    chunkSizeWarningLimit: 1000, // chunk 大小警告限制
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'nutui-vendor': ['@nutui/nutui'],
          'utils-vendor': ['axios'],
        },
        // 文件命名
        chunkFileNames: `assets/js/[name]-${buildVersion}-[hash].js`,
        entryFileNames: `assets/js/[name]-${buildVersion}-[hash].js`,
        assetFileNames: `assets/[ext]/[name]-${buildVersion}-[hash].[ext]`,
      },
    },
  },
  // 预览配置
  preview: {
    host: '0.0.0.0',
    port: 4173,
    open: false,
    cors: true,
  },
  // 优化配置
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@nutui/nutui', 'axios'],
  },
  }
})
