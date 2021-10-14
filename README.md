# \<t-moon-matrix>

Render a matrix of moon phases for the specified year.

![Screenshot](https://raw.githubusercontent.com/datadavev/t-moon-matrix/main/docs/20211014_ss_t-moon-matrix.png)

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

Demo at https://datadavev.github.io/t-moon-matrix

Source at https://github.com/datadavev/t-moon-matrix

## Installation

```bash
npm i t-moon-matrix
```

## Usage

```html
<script type="module">
  import 't-moon-matrix/t-moon-matrix.js';
</script>

<t-moon-matrix></t-moon-matrix>
```

## Linting and formatting

To scan the project for linting and formatting errors, run

```bash
npm run lint
```

To automatically fix linting and formatting errors, run

```bash
npm run format
```

## Demoing with Storybook

To run a local instance of Storybook for your component, run

```bash
npm run storybook
```

To build a production version of Storybook, run

```bash
npm run storybook:build
```


## Tooling configs

For most of the tools, the configuration is in the `package.json` to minimize the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
