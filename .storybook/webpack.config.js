const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');
const path = require('path');

module.exports = async ({ config, mode }) => {
  config.module.rules.push(
    {
      test: /\.scss$/, use: ['style-loader', 'css-loader', 'sass-loader']
    }
  );

  config.module.rules.push({
    test: /\.(stories|story)\.mdx$/,
    use: [
      {
        loader: 'babel-loader',
        // may or may not need this line depending on your app's setup        
        options: {
          plugins: ['@babel/plugin-transform-react-jsx'],
        },
      },
      {
        loader: '@mdx-js/loader',
        options: {
          compilers: [createCompiler({})],
        },
      },
    ],
  })

  config.module.rules.push({
    test: /\.(stories|story)\.[tj]sx?$/,
    loader: require.resolve('@storybook/source-loader'),
    exclude: [/node_modules/],
    enforce: 'pre',
  });

  config.resolve = {
    alias: {
      helpers: path.resolve(__dirname, '__helpers__/')
    },
    extensions: ['.js']
  };

  return config;
};