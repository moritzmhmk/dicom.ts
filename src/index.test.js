/**
 * @jest-environment jsdom
 */

/* eslint-disable import/first */
import fs from "fs";
import fetch from "node-fetch";

import {
	createCanvas,
	WebGLRenderingContext,
	WebGLActiveInfo,
	WebGLFramebuffer,
	WebGLBuffer,
	WebGLDrawingBufferWrapper,
	WebGLProgram,
	WebGLRenderbuffer,
	WebGLShader,
	WebGLShaderPrecisionFormat,
	WebGLTexture,
	WebGLUniformLocation
} from "node-canvas-webgl";
import { shaFromBuffer, shaFromJSON } from "./testUtils";

import * as dicomjs from ".";

/* eslint-disable */
if (!globalThis.fetch) {
	globalThis.fetch = fetch;
}

// need to be global (as they would be in browser) for twgl to get them!
if (globalThis.window) {
	window.WebGLRenderingContext = WebGLRenderingContext;
	window.WebGLActiveInfo = WebGLActiveInfo;
	window.WebGLFramebuffer = WebGLFramebuffer;
	window.WebGLBuffer = WebGLBuffer;
	window.WebGLDrawingBufferWrapper = WebGLDrawingBufferWrapper;
	window.WebGLProgram = WebGLProgram;
	window.WebGLRenderbuffer = WebGLRenderbuffer;
	window.WebGLShader = WebGLShader;
	window.WebGLShaderPrecisionFormat = WebGLShaderPrecisionFormat;
	window.WebGLTexture = WebGLTexture;
	window.WebGLUniformLocation = WebGLUniformLocation;
}
else {
	globalThis.WebGLRenderingContext = WebGLRenderingContext;
	globalThis.WebGLActiveInfo = WebGLActiveInfo;
	globalThis.WebGLFramebuffer = WebGLFramebuffer;
	globalThis.WebGLBuffer = WebGLBuffer;
	globalThis.WebGLDrawingBufferWrapper = WebGLDrawingBufferWrapper;
	globalThis.WebGLProgram = WebGLProgram;
	globalThis.WebGLRenderbuffer = WebGLRenderbuffer;
	globalThis.WebGLShader = WebGLShader;
	globalThis.WebGLShaderPrecisionFormat = WebGLShaderPrecisionFormat;
	globalThis.WebGLTexture = WebGLTexture;
	globalThis.WebGLUniformLocation = WebGLUniformLocation;
}
/* eslint-enable */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logImageTags = (image) => {
	let str = "";
	Object.keys(image.tags).forEach((key) => {
		str += image.tags[key].toString();
		str += "\n";
	});
	console.log(str);
};

describe("dicom.ts", () => {
	it("Renders with: RLE decode and 'contrastify' greyscale render", async () => {
		const data = fs.readFileSync("./test/medical.nema.org/compsamples_rle_20040210/IMAGES/RLE/CT1_RLE");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		// let str = "";
		// Object.keys(image.tags).forEach((key) => {
		// 	str += image.tags[key].toString();
		// 	str += "\n";
		// });
		// console.log(str);
		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("da1ce51ba1fa6c2c978313ab6d928fe62757c1a4");
	});

	it("Renders with: RLE decode and greyscale window render", async () => {
		const data = fs.readFileSync("./test/medical.nema.org/compsamples_rle_20040210/IMAGES/RLE/CT2_RLE");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		// logImageTags(image);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("1b7c395eb25578843b5bfb145846bfa215e6977f");
	});

	it("Renders with: RLE decode and RGB render", async () => {
		const data = fs.readFileSync("./test/medical.nema.org/compsamples_rle_20040210/IMAGES/RLE/VL6_RLE");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		// logImageTags(image);
		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("4b1680cfde967d0e1d1c0fcd110d69b796d6d2be");
	});

	it("Renders with: uncompressed greyscale with LUT descriptor", async () => {
		const data = fs.readFileSync("./test/vpop-pro.com/greyscale-with-lut.dcm");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		expect(shaFromBuffer(buffer)).toEqual("8ed96225c71e6f20ed7b5928637d797ac65920df");
	});

	it("Renders with: jpeg lossless", async () => {
		const data = fs.readFileSync("./test/medical.nema.org/compsamples_jpeg/IMAGES/JPLL/MR2_JPLL");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("b3ae869e6d0e478f66877c55654296f76e8375ee");
	});

	it("Renders with: jpeg baseline 8bit (native decoder?)", async () => {
		const data = fs.readFileSync("./test/vpop-pro.com/jpeg-baseline.dcm");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("5ca2e81cf09465e2dcdb69ebdb31195044feba43");
	});

	it("Renders with: jpeg baseline", async () => {
		const data = fs.readFileSync("./test/medical.nema.org/compsamples_jpeg/IMAGES/JPLY/MR1_JPLY");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		expect(image).toBeTruthy();
		// fs.writeFileSync("./image.png", buffer);
		const buffer = canvas.toBuffer("raw");
		expect(shaFromBuffer(buffer)).toEqual("7c06974e5259ec69e2b1f6e4d3c4284bd25f51c1");
	});

	it("Renders with: jpeg LS", async () => {
		const data = fs.readFileSync("./test/medical.nema.org/compsamples_jpegls/IMAGES/JLSL/XA1_JLSL");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		expect(image).toBeTruthy();
		// fs.writeFileSync("./image.png", buffer);
		const buffer = canvas.toBuffer("raw");
		expect(shaFromBuffer(buffer)).toEqual("7b85dff0595fe53312cd5c01843f4947f4b41717");
	});

	it("Renders with: jpeg2000 lossy", async () => {
		const data = fs.readFileSync("./test/medical.nema.org/compsamples_j2k/IMAGES/J2KI/US1_J2KI");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		expect(image).toBeTruthy();
		// fs.writeFileSync("./image.png", buffer);
		const buffer = canvas.toBuffer("raw");
		expect(shaFromBuffer(buffer)).toEqual("e8e17ceb10e97dbedaadc2926f8b60e6284745ea");
	});

	// issues

	it("Renders with: jpeg2000 lossless", async () => {
		const data = fs.readFileSync("./test/vpop-pro.com/jpeg-2000-lossless.dcm");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		expect(image).toBeTruthy();
		// fs.writeFileSync("./image.png", buffer);
		const buffer = canvas.toBuffer("raw");
		expect(shaFromBuffer(buffer)).toEqual("a9ca4d2c9436dd9811401ff11c222bbef53c7c99");
	});

	it("Renders all frames ok, reuses program", async () => {
		const data = fs.readFileSync("./test/medical.nema.org/multiframe/DISCIMG/IMAGES/BRMULTI");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		expect(image).toBeTruthy();
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		let sha = "";
		for (let i = 0; i < image.numberOfFrames; i += 1) {
			// eslint-disable-next-line no-await-in-loop
			await renderer.render(image, i);

			const buffer = canvas.toBuffer("raw");
			// fs.writeFileSync(`./image${i}.png`, buffer);
			sha = shaFromJSON(sha + buffer);
		}
		expect(sha).toEqual("c0d82c4e798f73aabb4a2962e6540bda777629af");
	});

	it("Resizes ok", async () => {
		const data = fs.readFileSync("./test/medical.nema.org/compsamples_rle_20040210/IMAGES/RLE/CT1_RLE");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		await dicomjs.render(image, canvas, 0.5);

		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("d35466c9ce981f7a22d39043145651bcc966ab14");
	});

	it("Renders with palette conversion", async () => {
		const data = fs.readFileSync("./test/dicom-ts-issues/US-PAL-8-10x-echo.dcm");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		await dicomjs.render(image, canvas);

		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("df184a8d047cd12559e718fde2f257f0e216b794");
	});

	it("Renders buffer size issue #19", async () => {
		const data = fs.readFileSync("./test/dicom-ts-issues/parse-issue-19.dcm");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		await dicomjs.render(image, canvas);

		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("bb623c71866709fa9621744318587a81fa1bfef1");
	});

	it("Renders RGB with planar configuration", async () => {
		const data = fs.readFileSync("./test/dicom-ts-issues/US-RGB-8-epicard.dcm");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		await dicomjs.render(image, canvas);

		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("25776c0785c1c12b999e737d5f2e06ee85a43f3b");
	});

	it("Renders with min/max pixel (no window) values", async () => {
		// this image fails on horos and cornerstone too, no data after parse...
		const data = fs.readFileSync("./test/medical.nema.org/compsamples_rle_20040210/IMAGES/RLE/NM1_RLE");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		expect(image).toBeTruthy();
		// fs.writeFileSync("./image.png", buffer);
		const buffer = canvas.toBuffer("raw");
		expect(shaFromBuffer(buffer)).toEqual("2b609351f2edc15298e9b02d0d9abfaa1a9455d6");
	});

	it("Renders with no transfer syntax, planar & palette size ratio", async () => {
		// this image fails on horos and cornerstone too, no data after parse...
		const data = fs.readFileSync("./test/dicom-ts-issues/OT-PAL-8-face.dcm");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		await renderer.render(image, 0);
		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("2fa9ec116d91b7b95a1d1ea9448c4e22038c8ac4");
	});

	it("Fails gracefully when no pixel data", async () => {
		// this image fails on horos and cornerstone too, no data after parse...
		const data = fs.readFileSync("./test/medical.nema.org/multiframe/DISCIMG/IMAGES/BRFSSPC1");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		let error = null;
		try {
			await dicomjs.render(image, canvas);
		}
		catch (e) {
			error = e;
		}

		expect(image).toBeTruthy();
		expect(error.message).toEqual("Image has no data");
	});

	// issues:
	it("Renders issue #20 wrong transfer syntax in file", async () => {
		// this image fails on horos too, no data after parse...
		const data = fs.readFileSync("./test/dicom-ts-issues/20-wrong-transfer-syntax.dcm");
		const dataView = new DataView(new Uint8Array(data).buffer);
		const image = dicomjs.parseImage(dataView);
		const canvas = createCanvas(512, 512);
		const renderer = new dicomjs.Renderer(canvas);
		let error = null;
		try {
			// expect this to fail
			await renderer.render(image, 0);
			expect(false).toBeTruthy();
		}
		catch (e) {
			error = e;
			// for some reason, DCMTK movescu -> Orthanc -> storescp uncompresses,
			// but doesnt update the transfer syntax tag...should it?
			image.transferSyntax = dicomjs.TransferSyntax.ImplicitLittle;
			renderer.image = null; // make sure we re-attempt creating decoder
			await renderer.render(image, 0);
		}
		expect(error.message).toEqual("No JPEG-LS image data");

		expect(image).toBeTruthy();
		const buffer = canvas.toBuffer("raw");
		// fs.writeFileSync("./image.png", buffer);
		expect(shaFromBuffer(buffer)).toEqual("e9a95dcc1e9a562a5bf43d67c5d1274c63917932");
	});
});
