function getEncapsulatedDataItem(data: DataView, offsetStart: number):any {
	let offset = offsetStart
	if (offset >= data.byteLength) {
		throw Error("Offset is larger than data length.")
	}

	const group = data.getUint16(offset, true);
	offset += 2;
	
	const element = data.getUint16(offset, true);
	offset += 2;

	if (group === 0xFFFE && element === 0xE0DD) { // Sequence Delimiter (FFFE, E0DD) -> end of encapsulated pixel data
		return null
	}

	if (group !== 0xFFFE || element !== 0xE000) { // Item (FFFE, E000)
		throw Error(`Expected a DICOM Item (0xFFFE, 0xE000) but found (${group.toString(16)}, ${element.toString(16)})`)
	}

	const length = data.getUint32(offset, true);
	offset += 4;

	let value = null
	if (length > 0) {
		value = new DataView(data.buffer, data.byteOffset + offset, length);
	}
	offset += length;

	return {value: value, offsetEnd: offset};
}

export const getEncapsulatedData = (encapsulatedData:DataView): DataView[] => {
	const values: DataView[] = [];
	try {
		let item = getEncapsulatedDataItem(encapsulatedData, 0);
		while (item !== null) {
			if (item.value) {
				values.push(item.value);
			}
			item = getEncapsulatedDataItem(encapsulatedData, item.offsetEnd);
		}
	}
	catch (err) {
		console.error(err); // TODO handle error
	}
	return values;
};

const concatDataViews = (dataViews:DataView[]):DataView => {
	if (dataViews.length === 1) {
		return dataViews[0]
	}
	let length = 0;
	let offset = 0;

	for (let ctr = 0; ctr < dataViews.length; ctr += 1) {
		length += dataViews[ctr].byteLength;
	}

	const tmp = new Uint8Array(length);
	let dataView;
	for (let ctr = 0; ctr < dataViews.length; ctr += 1) {
		dataView = dataViews[ctr];
		tmp.set(new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength), offset);
		offset += dataViews[ctr].byteLength;
	}

	return new DataView(tmp.buffer);
};

const JPEG_MAGIC_NUMBER = [0xFF, 0xD8];
const JPEG2000_MAGIC_NUMBER = [0xFF, 0x4F, 0xFF, 0x51];

const isHeaderJPEG = (data:DataView):boolean => {
	if (!data) {
		return false;
	}
	if (data.getUint8(0) !== JPEG_MAGIC_NUMBER[0]) {
		return false;
	}

	if (data.getUint8(1) !== JPEG_MAGIC_NUMBER[1]) {
		return false;
	}

	return true;
};

const isHeaderJPEG2000 = (data:DataView):boolean => {
	if (!data) {
		return false;
	}
	for (let ctr = 0; ctr < JPEG2000_MAGIC_NUMBER.length; ctr += 1) {
		if (data.getUint8(ctr) !== JPEG2000_MAGIC_NUMBER[ctr]) {
			return false;
		}
	}
	return true;
};

export const getJpegData = (encapsulatedData:DataView): DataView[] => {
	const dataViews = getEncapsulatedData(encapsulatedData);
	const jpegFrames:DataView[] = [];

	let currentJpegFragments:(DataView[] | null) = null;

	for (let dataView of dataViews) {
		if (isHeaderJPEG(dataView) || isHeaderJPEG2000(dataView)) {
			if (currentJpegFragments) {
				const jpegFrame = concatDataViews(currentJpegFragments)
				jpegFrames.push(jpegFrame)
			}
			currentJpegFragments = [];
		}
		if (currentJpegFragments) {
			currentJpegFragments.push(dataView);
		}
	}
	if (currentJpegFragments) {
		const jpegFrame = concatDataViews(currentJpegFragments)
		jpegFrames.push(jpegFrame)
	}

	return jpegFrames;
};
