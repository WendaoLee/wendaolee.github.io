'use strict';

const obsidian = require('obsidian');

class MdxAsMdPlugin extends obsidian.Plugin {
  async onload() {
    this.registerExtensions(['mdx'], 'markdown');
  }
}

module.exports = MdxAsMdPlugin;
