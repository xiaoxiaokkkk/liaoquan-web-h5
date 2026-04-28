// vite.config.js
import { defineConfig, loadEnv } from "file:///D:/githubnew/liaoquan/dev/liaoquan-web-h5/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/githubnew/liaoquan/dev/liaoquan-web-h5/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import postcsspxtoviewport8plugin from "file:///D:/githubnew/liaoquan/dev/liaoquan-web-h5/node_modules/postcss-px-to-viewport-8-plugin/lib/index.js";
var __vite_injected_original_dirname = "D:\\githubnew\\liaoquan\\dev\\liaoquan-web-h5";
function resolve(dir) {
  return path.join(__vite_injected_original_dirname, dir);
}
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawBasePath = env.VITE_BASE_PATH || "/";
  const basePath = rawBasePath === "/" ? "/" : `/${String(rawBasePath).replace(/^\/+|\/+$/g, "")}/`;
  return {
    base: basePath,
    plugins: [
      vue()
      // 开启 unplugin 插件，自动引入 NutUI 组件
      // Components({
      //   resolvers: [NutUIResolver()],
      // }),
    ],
    resolve: {
      alias: {
        "@": resolve("src")
      },
      extensions: [".js", ".json", ".ts", ".vue"]
    },
    server: {
      host: "0.0.0.0",
      // 允许外部访问
      port: 3e3,
      // 开发服务器端口
      open: false,
      // 是否自动打开浏览器
      cors: true,
      // 启用 CORS
      // 代理配置
      proxy: {
        // 解决下载跨域图片（二维码）时的 CORS 问题：通过同源代理转发到 CDN
        // 前端使用 `/__cdn__` 前缀访问即可，例如：`/__cdn__/lq/xxx/xxx.jpg`
        "/__cdn__": {
          target: "https://cdn.hnstylor.cn",
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/__cdn__/, "")
        },
        "/chatserver": {
          // target: 'http://localhost:8082', // 后端服务地址，根据实际情况修改
          target: "http://t.hainanjunfeng.com",
          changeOrigin: true
          // 是否改变请求源
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
        }
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
            unitToConvert: "px",
            // viewportWidth: file => {
            //   let num = 750;
            //   //van是375
            //   if (file.indexOf('van')>0) {
            //     num = 375;
            //   }
            //   return num;
            // },
            viewportWidth: 375,
            unitPrecision: 5,
            // 单位转换后保留的精度
            propList: ["*"],
            // 能转化为vw的属性列表
            viewportUnit: "vw",
            // 希望使用的视口单位
            fontViewportUnit: "vw",
            // 字体使用的视口单位
            selectorBlackList: ["ignore-"],
            // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
            minPixelValue: 1,
            // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
            mediaQuery: true,
            // 媒体查询里的单位是否需要转换单位
            replace: true,
            //  是否直接更换属性值，而不添加备用属性
            exclude: [],
            // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
            include: [],
            // 如果设置了include，那将只有匹配到的文件才会被转换
            landscape: false,
            // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
            landscapeUnit: "vw",
            // 横屏时使用的单位
            landscapeWidth: 1628
            // 横屏时使用的视口宽度
          })
        ]
      },
      preprocessorOptions: {
        scss: {
          // 默认京东 APP 10.0主题 > @import "@nutui/nutui/dist/styles/variables.scss";
          // 京东科技主题 > @import "@nutui/nutui/dist/styles/variables-jdt.scss";
          // 京东B商城主题 > @import "@nutui/nutui/dist/styles/variables-jdb.scss";
          // 京东企业业务主题 > @import "@nutui/nutui/dist/styles/variables-jddkh.scss";
          additionalData: (content) => {
            const customThemePath = path.resolve(__vite_injected_original_dirname, "src/assets/css/custom_theme.scss").replace(/\\/g, "/");
            return `@import "@nutui/nutui/dist/styles/variables-jdt.scss";
@import "${customThemePath}";
${content}`;
          }
        }
      }
    },
    // 构建配置
    build: {
      target: "es2015",
      // 构建目标
      outDir: "dist",
      // 输出目录
      assetsDir: "assets",
      // 静态资源目录
      sourcemap: false,
      // 生产环境不生成 sourcemap
      minify: "esbuild",
      // 使用 esbuild 压缩（Vite 默认，性能更好）
      // 如果需要使用 terser，需要先安装: npm install -D terser
      // minify: 'terser',
      // terserOptions: {
      //   compress: {
      //     drop_console: true, // 生产环境移除 console
      //     drop_debugger: true, // 移除 debugger
      //   },
      // },
      chunkSizeWarningLimit: 1e3,
      // chunk 大小警告限制
      rollupOptions: {
        output: {
          // 手动分包
          manualChunks: {
            "vue-vendor": ["vue", "vue-router", "pinia"],
            "nutui-vendor": ["@nutui/nutui"],
            "utils-vendor": ["axios"]
          },
          // 文件命名
          chunkFileNames: "assets/js/[name]-[hash].js",
          entryFileNames: "assets/js/[name]-[hash].js",
          assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
        }
      }
    },
    // 预览配置
    preview: {
      host: "0.0.0.0",
      port: 4173,
      open: false,
      cors: true
    },
    // 优化配置
    optimizeDeps: {
      include: ["vue", "vue-router", "pinia", "@nutui/nutui", "axios"]
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxnaXRodWJuZXdcXFxcbGlhb3F1YW5cXFxcZGV2XFxcXGxpYW9xdWFuLXdlYi1oNVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcZ2l0aHVibmV3XFxcXGxpYW9xdWFuXFxcXGRldlxcXFxsaWFvcXVhbi13ZWItaDVcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2dpdGh1Ym5ldy9saWFvcXVhbi9kZXYvbGlhb3F1YW4td2ViLWg1L3ZpdGUuY29uZmlnLmpzXCI7Ly8gdml0ZS5jb25maWcuanNcbmltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSdcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgcG9zdGNzc3B4dG92aWV3cG9ydDhwbHVnaW4gZnJvbSAncG9zdGNzcy1weC10by12aWV3cG9ydC04LXBsdWdpbic7XG5cbi8vIGltcG9ydCBDb21wb25lbnRzIGZyb20gJ3VucGx1Z2luLXZ1ZS1jb21wb25lbnRzL3ZpdGUnXG4vLyBpbXBvcnQgTnV0VUlSZXNvbHZlciBmcm9tICdAbnV0dWkvYXV0by1pbXBvcnQtcmVzb2x2ZXInXG5mdW5jdGlvbiByZXNvbHZlKCBkaXIgKSB7XG4gIHJldHVybiBwYXRoLmpvaW4oIF9fZGlybmFtZSwgZGlyIClcbn1cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIC8vIFx1NTJBMFx1OEY3RFx1NzNBRlx1NTg4M1x1NTNEOFx1OTFDRlx1RkYwOFx1NjgzOVx1NjM2RSBtb2RlIFx1NTJBMFx1OEY3RFx1NUJGOVx1NUU5NFx1NzY4NCAuZW52IFx1NjU4N1x1NEVGNlx1RkYwOVxuICAvLyBcdTRGOEJcdTU5ODJcdUZGMUFtb2RlPSdyZWxlYXNlJyBcdTRGMUFcdTUyQTBcdThGN0QgLmVudi5yZWxlYXNlXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpXG4gIFxuICAvLyBcdThCQkVcdTdGNkVcdTU3RkFcdTc4NDBcdThERUZcdTVGODRcdUZGMENcdTY1MkZcdTYzMDFcdTkwMUFcdThGQzdcdTczQUZcdTU4ODNcdTUzRDhcdTkxQ0YgVklURV9CQVNFX1BBVEggXHU5MTREXHU3RjZFXG4gIC8vIFx1NEY4Qlx1NTk4Mlx1RkYxQVZJVEVfQkFTRV9QQVRIPS9oNS8gXHU2MjE2IFZJVEVfQkFTRV9QQVRIPS9saWFvcXVhbi9cbiAgLy8gXHU1OTgyXHU2NzlDXHU0RTBEXHU4QkJFXHU3RjZFXHU3M0FGXHU1ODgzXHU1M0Q4XHU5MUNGXHVGRjBDXHU5RUQ4XHU4QkE0XHU0RTNBICcvJ1x1RkYwOFx1NjgzOVx1OERFRlx1NUY4NFx1RkYwOVxuICAvLyBcdTdFREZcdTRFMDBcdTg5QzRcdTgzMDNcdTUzMTZcdUZGMUFcdTc4NkVcdTRGREQgYmFzZSBcdTVGNjJcdTU5ODIgJy8nIFx1NjIxNiAnL3dlYmg1LydcdUZGMDhcdTUyNERcdTU0MEVcdTkwRkRcdTY3MDkgL1x1RkYwOVxuICBjb25zdCByYXdCYXNlUGF0aCA9IGVudi5WSVRFX0JBU0VfUEFUSCB8fCAnLydcbiAgY29uc3QgYmFzZVBhdGggPVxuICAgIHJhd0Jhc2VQYXRoID09PSAnLydcbiAgICAgID8gJy8nXG4gICAgICA6IGAvJHtTdHJpbmcocmF3QmFzZVBhdGgpLnJlcGxhY2UoL15cXC8rfFxcLyskL2csICcnKX0vYFxuICBcbiAgcmV0dXJuIHtcbiAgYmFzZTogYmFzZVBhdGgsXG4gIHBsdWdpbnM6IFtcbiAgICB2dWUoKSxcbiAgICAvLyBcdTVGMDBcdTU0MkYgdW5wbHVnaW4gXHU2M0QyXHU0RUY2XHVGRjBDXHU4MUVBXHU1MkE4XHU1RjE1XHU1MTY1IE51dFVJIFx1N0VDNFx1NEVGNlxuICAgIC8vIENvbXBvbmVudHMoe1xuICAgIC8vICAgcmVzb2x2ZXJzOiBbTnV0VUlSZXNvbHZlcigpXSxcbiAgICAvLyB9KSxcbiAgXSxcbiAgcmVzb2x2ZSA6IHtcbiAgICBhbGlhcyA6IHtcbiAgICAgICdAJyA6IHJlc29sdmUoICdzcmMnIClcbiAgICB9LFxuICAgIGV4dGVuc2lvbnMgOiBbJy5qcycsICcuanNvbicsICcudHMnLCAnLnZ1ZSddXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhvc3Q6ICcwLjAuMC4wJywgLy8gXHU1MTQxXHU4QkI4XHU1OTE2XHU5MEU4XHU4QkJGXHU5NUVFXG4gICAgcG9ydDogMzAwMCwgLy8gXHU1RjAwXHU1M0QxXHU2NzBEXHU1MkExXHU1NjY4XHU3QUVGXHU1M0UzXG4gICAgb3BlbjogZmFsc2UsIC8vIFx1NjYyRlx1NTQyNlx1ODFFQVx1NTJBOFx1NjI1M1x1NUYwMFx1NkQ0Rlx1ODlDOFx1NTY2OFxuICAgIGNvcnM6IHRydWUsIC8vIFx1NTQyRlx1NzUyOCBDT1JTXG4gICAgLy8gXHU0RUUzXHU3NDA2XHU5MTREXHU3RjZFXG4gICAgcHJveHk6IHtcbiAgICAgIC8vIFx1ODlFM1x1NTFCM1x1NEUwQlx1OEY3RFx1OERFOFx1NTdERlx1NTZGRVx1NzI0N1x1RkYwOFx1NEU4Q1x1N0VGNFx1NzgwMVx1RkYwOVx1NjVGNlx1NzY4NCBDT1JTIFx1OTVFRVx1OTg5OFx1RkYxQVx1OTAxQVx1OEZDN1x1NTQwQ1x1NkU5MFx1NEVFM1x1NzQwNlx1OEY2Q1x1NTNEMVx1NTIzMCBDRE5cbiAgICAgIC8vIFx1NTI0RFx1N0FFRlx1NEY3Rlx1NzUyOCBgL19fY2RuX19gIFx1NTI0RFx1N0YwMFx1OEJCRlx1OTVFRVx1NTM3M1x1NTNFRlx1RkYwQ1x1NEY4Qlx1NTk4Mlx1RkYxQWAvX19jZG5fXy9scS94eHgveHh4LmpwZ2BcbiAgICAgICcvX19jZG5fXyc6IHtcbiAgICAgICAgdGFyZ2V0OiAnaHR0cHM6Ly9jZG4uaG5zdHlsb3IuY24nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgIHNlY3VyZTogdHJ1ZSxcbiAgICAgICAgcmV3cml0ZTogKHApID0+IHAucmVwbGFjZSgvXlxcL19fY2RuX18vLCAnJyksXG4gICAgICB9LFxuICAgICAgJy9jaGF0c2VydmVyJzoge1xuICAgICAgICAvLyB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwODInLCAvLyBcdTU0MEVcdTdBRUZcdTY3MERcdTUyQTFcdTU3MzBcdTU3NDBcdUZGMENcdTY4MzlcdTYzNkVcdTVCOUVcdTk2NDVcdTYwQzVcdTUxQjVcdTRGRUVcdTY1MzlcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL3QuaGFpbmFuanVuZmVuZy5jb20nLFxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsIC8vIFx1NjYyRlx1NTQyNlx1NjUzOVx1NTNEOFx1OEJGN1x1NkM0Mlx1NkU5MFxuICAgICAgICAvLyBzZWN1cmU6IGZhbHNlLCAvLyBcdTU5ODJcdTY3OUNcdTY2MkYgaHR0cHMgXHU2M0E1XHU1M0UzXHVGRjBDXHU5NzAwXHU4OTgxXHU5MTREXHU3RjZFXHU4RkQ5XHU0RTJBXHU1M0MyXHU2NTcwXG4gICAgICAgIC8vIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9tb2JpbGVtLWFwaS8sICcnKSwgLy8gXHU5MUNEXHU1MTk5XHU4REVGXHU1Rjg0XHVGRjBDXHU1M0JCXHU2Mzg5IC9tb2JpbGVtLWFwaSBcdTUyNERcdTdGMDBcbiAgICAgICAgLy8gLy8gXHU2MjE2XHU4MDA1XHU0RkREXHU3NTU5IC9hcGkgXHU1MjREXHU3RjAwXHVGRjBDXHU2ODM5XHU2MzZFXHU1NDBFXHU3QUVGXHU2M0E1XHU1M0UzXHU4REVGXHU1Rjg0XHU1MUIzXHU1QjlBXG4gICAgICAgIC8vIC8vIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLFxuICAgICAgICAvLyBjb25maWd1cmU6IChwcm94eSwgb3B0aW9ucykgPT4ge1xuICAgICAgICAvLyAgIHByb3h5Lm9uKCdlcnJvcicsIChlcnIsIHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygncHJveHkgZXJyb3InLCBlcnIpO1xuICAgICAgICAvLyAgIH0pO1xuICAgICAgICAvLyAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgcmVxLCByZXMpID0+IHtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCdTZW5kaW5nIFJlcXVlc3QgdG8gdGhlIFRhcmdldDonLCByZXEubWV0aG9kLCByZXEudXJsKTtcbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy8gICBwcm94eS5vbigncHJveHlSZXMnLCAocHJveHlSZXMsIHJlcSwgcmVzKSA9PiB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZygnUmVjZWl2ZWQgUmVzcG9uc2UgZnJvbSB0aGUgVGFyZ2V0OicsIHByb3h5UmVzLnN0YXR1c0NvZGUsIHJlcS51cmwpO1xuICAgICAgICAvLyAgIH0pO1xuICAgICAgICAvLyB9LFxuICAgICAgfSxcbiAgICAgIC8vIFx1NTNFRlx1NEVFNVx1OTE0RFx1N0Y2RVx1NTkxQVx1NEUyQVx1NEVFM1x1NzQwNlxuICAgICAgLy8gJy9hcGkyJzoge1xuICAgICAgLy8gICB0YXJnZXQ6ICdodHRwOi8vbG9jYWxob3N0OjgwODEnLFxuICAgICAgLy8gICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAvLyAgIHNlY3VyZTogZmFsc2UsXG4gICAgICAvLyAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkyLywgJycpLFxuICAgICAgLy8gfSxcbiAgICB9XG4gIH0sXG4gIGNzczoge1xuICAgIHBvc3Rjc3M6IHtcbiAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgcG9zdGNzc3B4dG92aWV3cG9ydDhwbHVnaW4oe1xuICAgICAgICAgIHVuaXRUb0NvbnZlcnQ6ICdweCcsXG4gICAgICAgICAgLy8gdmlld3BvcnRXaWR0aDogZmlsZSA9PiB7XG4gICAgICAgICAgLy8gICBsZXQgbnVtID0gNzUwO1xuICAgICAgICAgIC8vICAgLy92YW5cdTY2MkYzNzVcbiAgICAgICAgICAvLyAgIGlmIChmaWxlLmluZGV4T2YoJ3ZhbicpPjApIHtcbiAgICAgICAgICAvLyAgICAgbnVtID0gMzc1O1xuICAgICAgICAgIC8vICAgfVxuICAgICAgICAgIC8vICAgcmV0dXJuIG51bTtcbiAgICAgICAgICAvLyB9LFxuICAgICAgICAgIHZpZXdwb3J0V2lkdGg6IDM3NSxcbiAgICAgICAgICB1bml0UHJlY2lzaW9uOiA1LCAvLyBcdTUzNTVcdTRGNERcdThGNkNcdTYzNjJcdTU0MEVcdTRGRERcdTc1NTlcdTc2ODRcdTdDQkVcdTVFQTZcbiAgICAgICAgICBwcm9wTGlzdDogWycqJ10sIC8vIFx1ODBGRFx1OEY2Q1x1NTMxNlx1NEUzQXZ3XHU3Njg0XHU1QzVFXHU2MDI3XHU1MjE3XHU4ODY4XG4gICAgICAgICAgdmlld3BvcnRVbml0OiAndncnLCAvLyBcdTVFMENcdTY3MUJcdTRGN0ZcdTc1MjhcdTc2ODRcdTg5QzZcdTUzRTNcdTUzNTVcdTRGNERcbiAgICAgICAgICBmb250Vmlld3BvcnRVbml0OiAndncnLCAvLyBcdTVCNTdcdTRGNTNcdTRGN0ZcdTc1MjhcdTc2ODRcdTg5QzZcdTUzRTNcdTUzNTVcdTRGNERcbiAgICAgICAgICBzZWxlY3RvckJsYWNrTGlzdDogWydpZ25vcmUtJ10sIC8vIFx1OTcwMFx1ODk4MVx1NUZGRFx1NzU2NVx1NzY4NENTU1x1OTAwOVx1NjJFOVx1NTY2OFx1RkYwQ1x1NEUwRFx1NEYxQVx1OEY2Q1x1NEUzQVx1ODlDNlx1NTNFM1x1NTM1NVx1NEY0RFx1RkYwQ1x1NEY3Rlx1NzUyOFx1NTM5Rlx1NjcwOVx1NzY4NHB4XHU3QjQ5XHU1MzU1XHU0RjREXHUzMDAyXG4gICAgICAgICAgbWluUGl4ZWxWYWx1ZTogMSwgLy8gXHU4QkJFXHU3RjZFXHU2NzAwXHU1QzBGXHU3Njg0XHU4RjZDXHU2MzYyXHU2NTcwXHU1MDNDXHVGRjBDXHU1OTgyXHU2NzlDXHU0RTNBMVx1NzY4NFx1OEJERFx1RkYwQ1x1NTNFQVx1NjcwOVx1NTkyN1x1NEU4RTFcdTc2ODRcdTUwM0NcdTRGMUFcdTg4QUJcdThGNkNcdTYzNjJcbiAgICAgICAgICBtZWRpYVF1ZXJ5OiB0cnVlLCAvLyBcdTVBOTJcdTRGNTNcdTY3RTVcdThCRTJcdTkxQ0NcdTc2ODRcdTUzNTVcdTRGNERcdTY2MkZcdTU0MjZcdTk3MDBcdTg5ODFcdThGNkNcdTYzNjJcdTUzNTVcdTRGNERcbiAgICAgICAgICByZXBsYWNlOiB0cnVlLCAvLyAgXHU2NjJGXHU1NDI2XHU3NkY0XHU2M0E1XHU2NkY0XHU2MzYyXHU1QzVFXHU2MDI3XHU1MDNDXHVGRjBDXHU4MDBDXHU0RTBEXHU2REZCXHU1MkEwXHU1OTA3XHU3NTI4XHU1QzVFXHU2MDI3XG4gICAgICAgICAgZXhjbHVkZTogW10sIC8vIFx1NUZGRFx1NzU2NVx1NjdEMFx1NEU5Qlx1NjU4N1x1NEVGNlx1NTkzOVx1NEUwQlx1NzY4NFx1NjU4N1x1NEVGNlx1NjIxNlx1NzI3OVx1NUI5QVx1NjU4N1x1NEVGNlx1RkYwQ1x1NEY4Qlx1NTk4MiAnbm9kZV9tb2R1bGVzJyBcdTRFMEJcdTc2ODRcdTY1ODdcdTRFRjZcbiAgICAgICAgICBpbmNsdWRlOiBbXSwgLy8gXHU1OTgyXHU2NzlDXHU4QkJFXHU3RjZFXHU0RTg2aW5jbHVkZVx1RkYwQ1x1OTBBM1x1NUMwNlx1NTNFQVx1NjcwOVx1NTMzOVx1OTE0RFx1NTIzMFx1NzY4NFx1NjU4N1x1NEVGNlx1NjI0RFx1NEYxQVx1ODhBQlx1OEY2Q1x1NjM2MlxuICAgICAgICAgIGxhbmRzY2FwZTogZmFsc2UsIC8vIFx1NjYyRlx1NTQyNlx1NkRGQlx1NTJBMFx1NjgzOVx1NjM2RSBsYW5kc2NhcGVXaWR0aCBcdTc1MUZcdTYyMTBcdTc2ODRcdTVBOTJcdTRGNTNcdTY3RTVcdThCRTJcdTY3NjFcdTRFRjYgQG1lZGlhIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKVxuICAgICAgICAgIGxhbmRzY2FwZVVuaXQ6ICd2dycsIC8vIFx1NkEyQVx1NUM0Rlx1NjVGNlx1NEY3Rlx1NzUyOFx1NzY4NFx1NTM1NVx1NEY0RFxuICAgICAgICAgIGxhbmRzY2FwZVdpZHRoOiAxNjI4LCAvLyBcdTZBMkFcdTVDNEZcdTY1RjZcdTRGN0ZcdTc1MjhcdTc2ODRcdTg5QzZcdTUzRTNcdTVCQkRcdTVFQTZcbiAgICAgICAgfSksXG4gICAgICBdXG4gICAgfSxcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XG4gICAgICBzY3NzOiB7XG4gICAgICAgIC8vIFx1OUVEOFx1OEJBNFx1NEVBQ1x1NEUxQyBBUFAgMTAuMFx1NEUzQlx1OTg5OCA+IEBpbXBvcnQgXCJAbnV0dWkvbnV0dWkvZGlzdC9zdHlsZXMvdmFyaWFibGVzLnNjc3NcIjtcbiAgICAgICAgLy8gXHU0RUFDXHU0RTFDXHU3OUQxXHU2MjgwXHU0RTNCXHU5ODk4ID4gQGltcG9ydCBcIkBudXR1aS9udXR1aS9kaXN0L3N0eWxlcy92YXJpYWJsZXMtamR0LnNjc3NcIjtcbiAgICAgICAgLy8gXHU0RUFDXHU0RTFDQlx1NTU0Nlx1NTdDRVx1NEUzQlx1OTg5OCA+IEBpbXBvcnQgXCJAbnV0dWkvbnV0dWkvZGlzdC9zdHlsZXMvdmFyaWFibGVzLWpkYi5zY3NzXCI7XG4gICAgICAgIC8vIFx1NEVBQ1x1NEUxQ1x1NEYwMVx1NEUxQVx1NEUxQVx1NTJBMVx1NEUzQlx1OTg5OCA+IEBpbXBvcnQgXCJAbnV0dWkvbnV0dWkvZGlzdC9zdHlsZXMvdmFyaWFibGVzLWpkZGtoLnNjc3NcIjtcbiAgICAgICAgYWRkaXRpb25hbERhdGE6IChjb250ZW50KSA9PiB7XG4gICAgICAgICAgY29uc3QgY3VzdG9tVGhlbWVQYXRoID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9hc3NldHMvY3NzL2N1c3RvbV90aGVtZS5zY3NzJykucmVwbGFjZSgvXFxcXC9nLCAnLycpXG4gICAgICAgICAgcmV0dXJuIGBAaW1wb3J0IFwiQG51dHVpL251dHVpL2Rpc3Qvc3R5bGVzL3ZhcmlhYmxlcy1qZHQuc2Nzc1wiO1xcbkBpbXBvcnQgXCIke2N1c3RvbVRoZW1lUGF0aH1cIjtcXG4ke2NvbnRlbnR9YFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICAvLyBcdTY3ODRcdTVFRkFcdTkxNERcdTdGNkVcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlczIwMTUnLCAvLyBcdTY3ODRcdTVFRkFcdTc2RUVcdTY4MDdcbiAgICBvdXREaXI6ICdkaXN0JywgLy8gXHU4RjkzXHU1MUZBXHU3NkVFXHU1RjU1XG4gICAgYXNzZXRzRGlyOiAnYXNzZXRzJywgLy8gXHU5NzU5XHU2MDAxXHU4RDQ0XHU2RTkwXHU3NkVFXHU1RjU1XG4gICAgc291cmNlbWFwOiBmYWxzZSwgLy8gXHU3NTFGXHU0RUE3XHU3M0FGXHU1ODgzXHU0RTBEXHU3NTFGXHU2MjEwIHNvdXJjZW1hcFxuICAgIG1pbmlmeTogJ2VzYnVpbGQnLCAvLyBcdTRGN0ZcdTc1MjggZXNidWlsZCBcdTUzOEJcdTdGMjlcdUZGMDhWaXRlIFx1OUVEOFx1OEJBNFx1RkYwQ1x1NjAyN1x1ODBGRFx1NjZGNFx1NTk3RFx1RkYwOVxuICAgIC8vIFx1NTk4Mlx1Njc5Q1x1OTcwMFx1ODk4MVx1NEY3Rlx1NzUyOCB0ZXJzZXJcdUZGMENcdTk3MDBcdTg5ODFcdTUxNDhcdTVCODlcdTg4QzU6IG5wbSBpbnN0YWxsIC1EIHRlcnNlclxuICAgIC8vIG1pbmlmeTogJ3RlcnNlcicsXG4gICAgLy8gdGVyc2VyT3B0aW9uczoge1xuICAgIC8vICAgY29tcHJlc3M6IHtcbiAgICAvLyAgICAgZHJvcF9jb25zb2xlOiB0cnVlLCAvLyBcdTc1MUZcdTRFQTdcdTczQUZcdTU4ODNcdTc5RkJcdTk2NjQgY29uc29sZVxuICAgIC8vICAgICBkcm9wX2RlYnVnZ2VyOiB0cnVlLCAvLyBcdTc5RkJcdTk2NjQgZGVidWdnZXJcbiAgICAvLyAgIH0sXG4gICAgLy8gfSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsIC8vIGNodW5rIFx1NTkyN1x1NUMwRlx1OEI2Nlx1NTQ0QVx1OTY1MFx1NTIzNlxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICAvLyBcdTYyNEJcdTUyQThcdTUyMDZcdTUzMDVcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgJ3Z1ZS12ZW5kb3InOiBbJ3Z1ZScsICd2dWUtcm91dGVyJywgJ3BpbmlhJ10sXG4gICAgICAgICAgJ251dHVpLXZlbmRvcic6IFsnQG51dHVpL251dHVpJ10sXG4gICAgICAgICAgJ3V0aWxzLXZlbmRvcic6IFsnYXhpb3MnXSxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gXHU2NTg3XHU0RUY2XHU1NDdEXHU1NDBEXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanMnLFxuICAgICAgICBlbnRyeUZpbGVOYW1lczogJ2Fzc2V0cy9qcy9bbmFtZV0tW2hhc2hdLmpzJyxcbiAgICAgICAgYXNzZXRGaWxlTmFtZXM6ICdhc3NldHMvW2V4dF0vW25hbWVdLVtoYXNoXS5bZXh0XScsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIC8vIFx1OTg4NFx1ODlDOFx1OTE0RFx1N0Y2RVxuICBwcmV2aWV3OiB7XG4gICAgaG9zdDogJzAuMC4wLjAnLFxuICAgIHBvcnQ6IDQxNzMsXG4gICAgb3BlbjogZmFsc2UsXG4gICAgY29yczogdHJ1ZSxcbiAgfSxcbiAgLy8gXHU0RjE4XHU1MzE2XHU5MTREXHU3RjZFXG4gIG9wdGltaXplRGVwczoge1xuICAgIGluY2x1ZGU6IFsndnVlJywgJ3Z1ZS1yb3V0ZXInLCAncGluaWEnLCAnQG51dHVpL251dHVpJywgJ2F4aW9zJ10sXG4gIH0sXG4gIH1cbn0pIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsY0FBYyxlQUFlO0FBQ3RDLE9BQU8sU0FBUztBQUNoQixP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
