/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import fs from 'fs';

import { test, expect } from './fixtures';
import { jpegjs, PNG } from 'packages/playwright-core/lib/utilsBundle';

test('browser_take_screenshot (viewport)', async ({ startClient, server }, testInfo) => {
  const { client } = await startClient({
    config: { outputDir: testInfo.outputPath('output') },
  });
  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toHaveResponse({
    code: expect.stringContaining(`page.goto('http://localhost`),
  });

  expect(await client.callTool({
    name: 'browser_take_screenshot',
  })).toHaveResponse({
    code: expect.stringContaining(`await page.screenshot`),
    attachments: [{
      data: expect.any(String),
      mimeType: 'image/png',
      type: 'image',
    }],
  });
});

test('browser_take_screenshot (element)', async ({ startClient, server }, testInfo) => {
  const { client } = await startClient({
    config: { outputDir: testInfo.outputPath('output') },
  });
  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toHaveResponse({
    pageState: expect.stringContaining(`[ref=e1]`),
  });

  expect(await client.callTool({
    name: 'browser_take_screenshot',
    arguments: {
      element: 'hello button',
      ref: 'e1',
    },
  })).toEqual({
    content: [
      {
        text: expect.stringContaining(`page.getByText('Hello, world!').screenshot`),
        type: 'text',
      },
      {
        data: expect.any(String),
        mimeType: 'image/png',
        type: 'image',
      },
    ],
  });
});

test('--output-dir should work', async ({ startClient, server }, testInfo) => {
  const outputDir = testInfo.outputPath('output');
  const { client } = await startClient({
    config: { outputDir },
  });
  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toHaveResponse({
    code: expect.stringContaining(`page.goto('http://localhost`),
  });

  await client.callTool({
    name: 'browser_take_screenshot',
  });

  expect(fs.existsSync(outputDir)).toBeTruthy();
  const files = [...fs.readdirSync(outputDir)].filter(f => f.endsWith('.png'));
  expect(files).toHaveLength(1);
  expect(files[0]).toMatch(/^page-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.png$/);
});

for (const type of ['png', 'jpeg']) {
  test(`browser_take_screenshot (type: ${type})`, async ({ startClient, server }, testInfo) => {
    const outputDir = testInfo.outputPath('output');
    const { client } = await startClient({
      config: { outputDir },
    });
    expect(await client.callTool({
      name: 'browser_navigate',
      arguments: { url: server.PREFIX },
    })).toHaveResponse({
      code: expect.stringContaining(`page.goto('http://localhost`),
    });

    expect(await client.callTool({
      name: 'browser_take_screenshot',
      arguments: { type },
    })).toEqual({
      content: [
        {
          text: expect.stringMatching(
              new RegExp(`page-\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}\\-\\d{3}Z\\.${type}`)
          ),
          type: 'text',
        },
        {
          data: expect.any(String),
          mimeType: `image/${type}`,
          type: 'image',
        },
      ],
    });

    const files = [...fs.readdirSync(outputDir)].filter(f => f.endsWith(`.${type}`));

    expect(fs.existsSync(outputDir)).toBeTruthy();
    expect(files).toHaveLength(1);
    expect(files[0]).toMatch(
        new RegExp(`^page-\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}-\\d{3}Z\\.${type}$`)
    );
  });

}

test('browser_take_screenshot (default type should be png)', async ({ startClient, server }, testInfo) => {
  const outputDir = testInfo.outputPath('output');
  const { client } = await startClient({
    config: { outputDir },
  });
  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.PREFIX },
  })).toHaveResponse({
    code: `await page.goto('${server.PREFIX}');`,
  });

  expect(await client.callTool({
    name: 'browser_take_screenshot',
  })).toEqual({
    content: [
      {
        text: expect.stringMatching(
            new RegExp(`page-\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}\\-\\d{3}Z\\.png`)
        ),
        type: 'text',
      },
      {
        data: expect.any(String),
        mimeType: 'image/png',
        type: 'image',
      },
    ],
  });

  const files = [...fs.readdirSync(outputDir)].filter(f => f.endsWith('.png'));

  expect(fs.existsSync(outputDir)).toBeTruthy();
  expect(files).toHaveLength(1);
  expect(files[0]).toMatch(/^page-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d{3}Z\.png$/);
});

test('browser_take_screenshot (filename is empty string)', async ({ startClient, server }, testInfo) => {
  const outputDir = testInfo.outputPath('output');
  const { client } = await startClient({
    config: { outputDir },
  });
  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toHaveResponse({
    code: expect.stringContaining(`page.goto('http://localhost`),
  });

  expect(await client.callTool({
    name: 'browser_take_screenshot',
    arguments: {
      filename: '',
    },
  })).toEqual({
    content: [
      {
        text: expect.stringMatching(
            new RegExp(`page-\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}\\-\\d{3}Z\\.png`)
        ),
        type: 'text',
      },
      {
        data: expect.any(String),
        mimeType: 'image/png',
        type: 'image',
      },
    ],
  });

  const files = [...fs.readdirSync(outputDir)].filter(f => f.endsWith('.png'));

  expect(fs.existsSync(outputDir)).toBeTruthy();
  expect(files).toHaveLength(1);
  expect(files[0]).toMatch(
      new RegExp(`^page-\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}-\\d{3}Z\\.png$`)
  );
});


test('browser_take_screenshot (filename: "output.png")', async ({ startClient, server }, testInfo) => {
  const outputDir = testInfo.outputPath('output');
  const { client } = await startClient({
    config: { outputDir },
  });
  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toHaveResponse({
    code: expect.stringContaining(`page.goto('http://localhost`),
  });

  expect(await client.callTool({
    name: 'browser_take_screenshot',
    arguments: {
      filename: 'output.png',
    },
  })).toEqual({
    content: [
      {
        text: expect.stringContaining(`output.png`),
        type: 'text',
      },
      {
        data: expect.any(String),
        mimeType: 'image/png',
        type: 'image',
      },
    ],
  });

  const files = [...fs.readdirSync(outputDir)].filter(f => f.endsWith('.png'));

  expect(fs.existsSync(outputDir)).toBeTruthy();
  expect(files).toHaveLength(1);
  expect(files[0]).toMatch(/^output\.png$/);
});

test('browser_take_screenshot (imageResponses=omit)', async ({ startClient, server }, testInfo) => {
  const outputDir = testInfo.outputPath('output');
  const { client } = await startClient({
    config: {
      outputDir,
      imageResponses: 'omit',
    },
  });

  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toHaveResponse({
    code: expect.stringContaining(`page.goto('http://localhost`),
  });

  await client.callTool({
    name: 'browser_take_screenshot',
  });

  expect(await client.callTool({
    name: 'browser_take_screenshot',
  })).toEqual({
    content: [
      {
        text: expect.stringContaining(`await page.screenshot`),
        type: 'text',
      },
    ],
  });
});

test('browser_take_screenshot (fullPage: true)', async ({ startClient, server }, testInfo) => {
  const { client } = await startClient({
    config: { outputDir: testInfo.outputPath('output') },
  });
  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toHaveResponse({
    code: expect.stringContaining(`page.goto('http://localhost`),
  });

  expect(await client.callTool({
    name: 'browser_take_screenshot',
    arguments: { fullPage: true },
  })).toEqual({
    content: [
      {
        text: expect.stringContaining('fullPage: true'),
        type: 'text',
      },
      {
        data: expect.any(String),
        mimeType: 'image/png',
        type: 'image',
      },
    ],
  });
});

test('browser_take_screenshot size cap', async ({ startClient, server, mcpBrowser }, testInfo) => {
  test.skip(!['chrome', 'msedge', 'chromium'].includes(mcpBrowser ?? ''), 'Non-chrome has unusual full page size');

  const { client } = await startClient({
    config: { outputDir: testInfo.outputPath('output') },
  });

  const expectations = [
    { title: '2000x500', pageWidth: 2000, pageHeight: 500, expectedWidth: 1568, expectedHeight: 500 * 1568 / 2000 | 0 },
    { title: '2000x2000', pageWidth: 2000, pageHeight: 2000, expectedWidth: 1098, expectedHeight: 1098 },
    { title: '1280x800', pageWidth: 1280, pageHeight: 800, expectedWidth: 1280, expectedHeight: 800 },
  ];

  for (const expectation of expectations) {
    await test.step(expectation.title, async () => {
      server.setContent('/', `<body style="width: ${expectation.pageWidth}px; height: ${expectation.pageHeight}px; background: red; margin: 0;"></body>`, 'text/html');
      await client.callTool({ name: 'browser_navigate', arguments: { url: server.PREFIX } });

      const pngResult = await client.callTool({
        name: 'browser_take_screenshot',
        arguments: { fullPage: true },
      });
      const png = PNG.sync.read(Buffer.from(pngResult.content?.[1]?.data, 'base64'));
      expect(png.width).toBe(expectation.expectedWidth);
      expect(png.height).toBe(expectation.expectedHeight);

      const jpegResult = await client.callTool({
        name: 'browser_take_screenshot',
        arguments: { fullPage: true, type: 'jpeg' },
      });
      const jpeg = jpegjs.decode(Buffer.from(jpegResult.content?.[1]?.data, 'base64'));
      expect(jpeg.width).toBe(expectation.expectedWidth);
      expect(jpeg.height).toBe(expectation.expectedHeight);
    });
  }
});

test('browser_take_screenshot (fullPage with element should error)', async ({ startClient, server }, testInfo) => {
  const { client } = await startClient({
    config: { outputDir: testInfo.outputPath('output') },
  });
  expect(await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  })).toHaveResponse({
    pageState: expect.stringContaining(`[ref=e1]`),
  });

  const result = await client.callTool({
    name: 'browser_take_screenshot',
    arguments: {
      fullPage: true,
      element: 'hello button',
      ref: 'e1',
    },
  });

  expect(result.isError).toBe(true);
  expect(result.content?.[0]?.text).toContain('fullPage cannot be used with element screenshots');
});

test('browser_take_screenshot (viewport without snapshot)', async ({ startClient, server }, testInfo) => {
  const { client } = await startClient({
    config: { outputDir: testInfo.outputPath('output') },
  });

  // Ensure we have a tab but don't navigate anywhere (no snapshot captured)
  expect(await client.callTool({
    name: 'browser_tabs',
    arguments: {
      action: 'list',
    },
  })).toHaveResponse({
    tabs: `- 0: (current) [] (about:blank)`,
  });

  // This should work without requiring a snapshot since it's a viewport screenshot
  expect(await client.callTool({
    name: 'browser_take_screenshot',
  })).toEqual({
    content: [
      {
        text: expect.stringContaining(`page.screenshot`),
        type: 'text',
      },
      {
        data: expect.any(String),
        mimeType: 'image/png',
        type: 'image',
      },
    ],
  });
});

test('browser_take_screenshot validates actual image format matches declared MIME type (issue #1211)', async ({ startClient, server }, testInfo) => {
  const { client } = await startClient({
    config: { outputDir: testInfo.outputPath('output') },
  });

  await client.callTool({
    name: 'browser_navigate',
    arguments: { url: server.HELLO_WORLD },
  });

  // Test default (no type specified) - should be PNG with image/png MIME type
  const defaultResult = await client.callTool({
    name: 'browser_take_screenshot',
  });
  expect(defaultResult.content?.[1]?.mimeType).toBe('image/png');
  const defaultBuffer = Buffer.from(defaultResult.content?.[1]?.data, 'base64');
  // PNG files start with magic bytes: 89 50 4E 47 (‰PNG)
  expect(defaultBuffer[0]).toBe(0x89);
  expect(defaultBuffer[1]).toBe(0x50);
  expect(defaultBuffer[2]).toBe(0x4E);
  expect(defaultBuffer[3]).toBe(0x47);
  // Verify it's NOT JPEG (which starts with FF D8 FF)
  expect(defaultBuffer[0]).not.toBe(0xFF);

  // Test explicit PNG type
  const pngResult = await client.callTool({
    name: 'browser_take_screenshot',
    arguments: { type: 'png' },
  });
  expect(pngResult.content?.[1]?.mimeType).toBe('image/png');
  const pngBuffer = Buffer.from(pngResult.content?.[1]?.data, 'base64');
  expect(pngBuffer[0]).toBe(0x89);
  expect(pngBuffer[1]).toBe(0x50);
  expect(pngBuffer[2]).toBe(0x4E);
  expect(pngBuffer[3]).toBe(0x47);

  // Test explicit JPEG type - should be JPEG with image/jpeg MIME type
  const jpegResult = await client.callTool({
    name: 'browser_take_screenshot',
    arguments: { type: 'jpeg' },
  });
  expect(jpegResult.content?.[1]?.mimeType).toBe('image/jpeg');
  const jpegBuffer = Buffer.from(jpegResult.content?.[1]?.data, 'base64');
  // JPEG files start with magic bytes: FF D8 FF
  expect(jpegBuffer[0]).toBe(0xFF);
  expect(jpegBuffer[1]).toBe(0xD8);
  expect(jpegBuffer[2]).toBe(0xFF);
  // Verify it's NOT PNG
  expect(jpegBuffer[0]).not.toBe(0x89);
});
