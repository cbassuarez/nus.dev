export class Vt {
    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        VtFinalization.unregister(this);
        return ptr;
    }
    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_vt_free(ptr, 0);
    }
    /**
     * True when the cursor sits at a shell prompt — from OSC 133 marks in the
     * stream, which is how the app knows a command line from program output.
     * @returns {boolean}
     */
    get at_prompt() {
        const ret = wasm.vt_at_prompt(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
     * Pointer into wasm memory; JS wraps it in a `Uint32Array`.
     *
     * Only valid until the next call that can reallocate (`resize`,
     * `snapshot` after a resize), so the page re-reads it each frame.
     * @returns {number}
     */
    get cells() {
        const ret = wasm.vt_cells(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get cells_len() {
        const ret = wasm.vt_cells_len(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get cols() {
        const ret = wasm.vt_cols(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get cursor_col() {
        const ret = wasm.vt_cursor_col(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get cursor_row() {
        const ret = wasm.vt_cursor_row(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get default_bg() {
        const ret = wasm.vt_default_bg(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * @returns {number}
     */
    get default_fg() {
        const ret = wasm.vt_default_fg(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Feed raw PTY bytes — exactly the bytes a shell wrote.
     * @param {Uint8Array} bytes
     */
    feed(bytes) {
        const ptr0 = passArray8ToWasm0(bytes, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.vt_feed(this.__wbg_ptr, ptr0, len0);
    }
    /**
     * @param {number} cols
     * @param {number} rows
     * @param {number} scrollback
     */
    constructor(cols, rows, scrollback) {
        const ret = wasm.vt_new(cols, rows, scrollback);
        this.__wbg_ptr = ret;
        VtFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} cols
     * @param {number} rows
     */
    resize(cols, rows) {
        wasm.vt_resize(this.__wbg_ptr, cols, rows);
    }
    /**
     * @returns {number}
     */
    get rows() {
        const ret = wasm.vt_rows(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
     * Repaint the palette for a theme change. `ansi` is 16 packed RGB words.
     *
     * The app's themes drive the palette exactly this way, so the hero
     * changing colour with the page is the real mechanism, not a CSS filter.
     * @param {number} fg
     * @param {number} bg
     * @param {number} cursor
     * @param {Uint32Array} ansi
     */
    set_theme(fg, bg, cursor, ansi) {
        const ptr0 = passArray32ToWasm0(ansi, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.vt_set_theme(this.__wbg_ptr, fg, bg, cursor, ptr0, len0);
    }
    /**
     * Re-read the visible grid into the frame buffer.
     *
     * Each cell is `[codepoint, fg_rgb, bg_rgb, flags]`. Colours are already
     * resolved through the palette, so OSC 4/10/11 overrides in the recorded
     * stream land here the same way they land in the app.
     */
    snapshot() {
        wasm.vt_snapshot(this.__wbg_ptr);
    }
    /**
     * Text of the visible grid — what a selection would copy.
     * @returns {string}
     */
    text() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.vt_text(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
    /**
     * Advance timers (cursor blink phase, etc.).
     */
    tick() {
        wasm.vt_tick(this.__wbg_ptr);
    }
    /**
     * @returns {string}
     */
    get title() {
        let deferred1_0;
        let deferred1_1;
        try {
            const ret = wasm.vt_title(this.__wbg_ptr);
            deferred1_0 = ret[0];
            deferred1_1 = ret[1];
            return getStringFromWasm0(ret[0], ret[1]);
        } finally {
            wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
        }
    }
}
if (Symbol.dispose) Vt.prototype[Symbol.dispose] = Vt.prototype.free;

/**
 * Colour constants are exported so the painter never re-derives them.
 * @returns {Uint32Array}
 */
export function flag_bits() {
    const ret = wasm.flag_bits();
    var v1 = getArrayU32FromWasm0(ret[0], ret[1]).slice();
    wasm.__wbindgen_free(ret[0], ret[1] * 4, 4);
    return v1;
}

/**
 * Which `nus-vt` this was built from, so the page can name it.
 * @returns {string}
 */
export function vt_source_rev() {
    let deferred1_0;
    let deferred1_1;
    try {
        const ret = wasm.vt_source_rev();
        deferred1_0 = ret[0];
        deferred1_1 = ret[1];
        return getStringFromWasm0(ret[0], ret[1]);
    } finally {
        wasm.__wbindgen_free(deferred1_0, deferred1_1, 1);
    }
}
function __wbg_get_imports() {
    const import0 = {
        __proto__: null,
        __wbg___wbindgen_throw_5d9e815e6fdf150f: function(arg0, arg1) {
            throw new Error(getStringFromWasm0(arg0, arg1));
        },
        __wbindgen_init_externref_table: function() {
            const table = wasm.__wbindgen_externrefs;
            const offset = table.grow(4);
            table.set(0, undefined);
            table.set(offset + 0, undefined);
            table.set(offset + 1, null);
            table.set(offset + 2, true);
            table.set(offset + 3, false);
        },
    };
    return {
        __proto__: null,
        "./nus_vt_wasm_bg.js": import0,
    };
}

const VtFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_vt_free(ptr, 1));

function getArrayU32FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getUint32ArrayMemory0().subarray(ptr / 4, ptr / 4 + len);
}

function getStringFromWasm0(ptr, len) {
    return decodeText(ptr >>> 0, len);
}

let cachedUint32ArrayMemory0 = null;
function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

function passArray8ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 1, 1) >>> 0;
    getUint8ArrayMemory0().set(arg, ptr / 1);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

let cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
cachedTextDecoder.decode();
const MAX_SAFARI_DECODE_BYTES = 2146435072;
let numBytesDecoded = 0;
function decodeText(ptr, len) {
    numBytesDecoded += len;
    if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
        cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });
        cachedTextDecoder.decode();
        numBytesDecoded = len;
    }
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

let wasmModule, wasmInstance, wasm;
function __wbg_finalize_init(instance, module) {
    wasmInstance = instance;
    wasm = instance.exports;
    wasmModule = module;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;
    wasm.__wbindgen_start();
    return wasm;
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (!module.ok) {
            throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
        }

        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);
            } catch (e) {
                const validResponse = expectedResponseType(module.type);

                if (validResponse && module.headers.get('Content-Type') !== 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else { throw e; }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);
    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };
        } else {
            return instance;
        }
    }

    function expectedResponseType(type) {
        switch (type) {
            case 'basic': case 'cors': case 'default': return true;
        }
        return false;
    }
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (module !== undefined) {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();
    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }
    const instance = new WebAssembly.Instance(module, imports);
    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (module_or_path !== undefined) {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (module_or_path === undefined) {
        module_or_path = new URL('nus_vt_wasm_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync, __wbg_init as default };
