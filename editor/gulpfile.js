import path from "path";
import gulp from "gulp";
import htmlmin from "gulp-htmlmin";
import jsonminify from "gulp-jsonminify";
import svgo from "gulp-svgo";
import changed, {compareContents} from "gulp-changed";
import autoprefixer from "gulp-autoprefixer";
import FileIndex from "@emcjs/core/build_tools/FileIndex.js";
import ImageIndex from "@emcjs/core/build_tools/ImageIndex.js";
import LanguageManager from "@emcjs/core/build_tools/LanguageManager.js";
import ImportAnalyzer from "@emcjs/core/build_tools/ImportAnalyzer.js";
import {readJSONFile} from "@emcjs/core/build_tools/util/ReadJSONFile.js";
import {mergeStream} from "@emcjs/core/build_tools/util/MergeStream.js";
import {packScript} from "@emcjs/core/build_tools/PackScript.js";
import sourceImport from "@emcjs/fe/build_tools/sourceImport.js";

const __dirname = path.resolve("..");

const NODE_FOLDER = path.resolve(__dirname, "node_modules");

const SRC_PATH = path.resolve(__dirname, "editor/src");
const BUILD_PATH = path.resolve(__dirname, "editor/build");
const TRACKER_SRC_PATH = path.resolve(__dirname, "src");

const DEPENDENCIES = readJSONFile(path.resolve(__dirname, "editor/build_dependencies.json"));

/* configuration */
const DELETE_UNUSED_FILES = process.argv.indexOf("-nodelete") < 0;
const NOCOMPRESS = process.argv.indexOf("-nocompress") >= 0;
const REBUILD = process.argv.indexOf("-rebuild") >= 0;
const REBUILDJS = process.argv.indexOf("-rebuildjs") >= 0;

console.log({
    DELETE_UNUSED_FILES,
    NOCOMPRESS,
    REBUILDJS,
    REBUILD
});

function copyJS(files, src, dest) {
    let res = gulp.src(files);
    res = res.pipe(FileIndex.register(src, dest));
    res = res.pipe(ImportAnalyzer.register(src, dest, __dirname));
    res = res.pipe(sourceImport());
    if (!REBUILDJS && !REBUILD) {
        res = res.pipe(changed(dest, {hasChanged: compareContents}));
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function buildWorker(files, src, dest) {
    let res = gulp.src(files);
    res = res.pipe(ImportAnalyzer.register(src, dest, __dirname));
    res = res.pipe(FileIndex.addThrough(src, dest, true));
    res = res.pipe(packScript());
    res = res.pipe(FileIndex.addThrough(src, dest, true));
    if (!REBUILD) {
        res = res.pipe(changed(dest, {hasChanged: compareContents}));
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

/* PREPARE */
function prepareDependencyPathRewrites(done = () => {}) {
    for (const dependency of DEPENDENCIES) {
        if ("js" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.js.src);
            const DST = `${BUILD_PATH}/${dependency.js.dest}`;
            ImportAnalyzer.setPathRewriteRule(SRC, DST);
        }
    }
    done();
}

/* DEPENDENCIES START */
function copyDependencyScripts() {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("js" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.js.src);
            const DST = `${BUILD_PATH}/${dependency.js.dest}`;
            const FILES = [
                `${SRC}/**/*.js`
            ];
            result.push(copyJS(FILES, SRC, DST));
        }
    }
    return mergeStream(...result);
}

function buildDependencyWorker() {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("js" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.js.src);
            const DST = `${BUILD_PATH}/${dependency.js.dest}`;
            const FILES = [
                `${SRC}/**/*.w.js`
            ];
            result.push(buildWorker(FILES, SRC, DST));
        }
    }
    return mergeStream(...result);
}

function copyDependencyCSS() {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("css" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.css.src);
            const DST = `${BUILD_PATH}/${dependency.css.dest}`;
            const FILES = [
                `${SRC}/**/*.css`
            ];
            let res = gulp.src(FILES);
            res = res.pipe(FileIndex.register(SRC, DST));
            if (!REBUILD) {
                res = res.pipe(changed(DST));
            }
            res = res.pipe(autoprefixer());
            res = res.pipe(gulp.dest(DST));
            result.push(res);
        }
    }
    return mergeStream(...result);
}

function copyDependencyFonts() {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("css" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.font.src);
            const DST = `${BUILD_PATH}/${dependency.font.dest}`;
            const FILES = [
                `${SRC}/**/*.ttf`,
                `${SRC}/**/*.eot`,
                `${SRC}/**/*.otf`,
                `${SRC}/**/*.woff`,
                `${SRC}/**/*.woff2`,
                `${SRC}/**/*.svg`
            ];
            let res = gulp.src(FILES);
            res = res.pipe(FileIndex.register(SRC, DST));
            if (!REBUILD) {
                res = res.pipe(changed(DST));
            }
            res = res.pipe(gulp.dest(DST));
            result.push(res);
        }
    }
    return mergeStream(...result);
}
/* DEPENDENCIES END */

function copyScript() {
    const FILES = [
        `${SRC_PATH}/**/*.js`
    ];
    return copyJS(FILES, SRC_PATH, BUILD_PATH);
}

function copyHTML() {
    const FILES = [
        `${SRC_PATH}/**/*.html`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, BUILD_PATH));
    if (!REBUILD) {
        res = res.pipe(newer(BUILD_PATH));
    }
    res = res.pipe(htmlmin({collapseWhitespace: true}));
    res = res.pipe(gulp.dest(BUILD_PATH));
    return res;
}

function copyJSON() {
    const FILES = [
        `${SRC_PATH}/**/*.json`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, BUILD_PATH));
    if (!REBUILD) {
        res = res.pipe(newer(BUILD_PATH));
    }
    if (!NOCOMPRESS) {
        res = res.pipe(jsonminify());
    }
    res = res.pipe(gulp.dest(BUILD_PATH));
    return res;
}

function copyCSS() {
    const FILES = [
        `${SRC_PATH}/**/*.css`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(SRC_PATH, BUILD_PATH));
    if (!REBUILD) {
        res = res.pipe(newer(BUILD_PATH));
    }
    res = res.pipe(autoprefixer());
    res = res.pipe(gulp.dest(BUILD_PATH));
    return res;
}

function copyFonts() {
    const FILES = [
        `${SRC_PATH}/fonts/**/*.ttf`,
        `${SRC_PATH}/fonts/**/*.eot`,
        `${SRC_PATH}/fonts/**/*.otf`,
        `${SRC_PATH}/fonts/**/*.woff`,
        `${SRC_PATH}/fonts/**/*.woff2`,
        `${SRC_PATH}/fonts/**/*.svg`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${SRC_PATH}/fonts`, `${BUILD_PATH}/fonts`));
    if (!REBUILD) {
        res = res.pipe(newer(`${BUILD_PATH}/fonts`));
    }
    res = res.pipe(gulp.dest(`${BUILD_PATH}/fonts`));
    return res;
}

// ------------------------------------

// TODO compile language
function copyTrackerI18N() {
    const FILES = [
        `${TRACKER_SRC_PATH}/i18n/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${TRACKER_SRC_PATH}/i18n`, `${BUILD_PATH}/i18n`));
    res = res.pipe(LanguageManager.register(`${TRACKER_SRC_PATH}/i18n`, `${BUILD_PATH}/i18n`));
    if (!REBUILD) {
        res = res.pipe(newer(`${BUILD_PATH}/i18n`));
    }
    res = res.pipe(gulp.dest(`${BUILD_PATH}/i18n`));
    return res;
}

function copyTrackerI18NFragments() {
    const FILES = [
        `${TRACKER_SRC_PATH}/i18n/fragments/**/*.js`,
        `${TRACKER_SRC_PATH}/i18n/fragments/**/*.json`,
        `${TRACKER_SRC_PATH}/i18n/fragments/**/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${TRACKER_SRC_PATH}/i18n/fragments`, `${BUILD_PATH}/i18n/fragments`));
    if (!REBUILD) {
        res = res.pipe(newer(`${BUILD_PATH}/i18n/fragments`));
    }
    res = res.pipe(gulp.dest(`${BUILD_PATH}/i18n/fragments`));
    return res;
}

function copyTrackerImg() {
    const FILES = [
        `${TRACKER_SRC_PATH}/images/**/*.svg`,
        `${TRACKER_SRC_PATH}/images/**/*.png`,
        `${TRACKER_SRC_PATH}/images/**/*.webp`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${TRACKER_SRC_PATH}/images`, `${BUILD_PATH}/images`));
    res = res.pipe(ImageIndex.register(`${TRACKER_SRC_PATH}/images`, `${BUILD_PATH}/images`));
    if (!REBUILD) {
        res = res.pipe(newer(`${BUILD_PATH}/images`));
    }
    res = res.pipe(svgo());
    res = res.pipe(gulp.dest(`${BUILD_PATH}/images`));
    return res;
}

// ------------------------------------

function finish(done) {
    FileIndex.add(LanguageManager.finish(`${BUILD_PATH}/i18n`));
    FileIndex.add(path.resolve(BUILD_PATH, "_libs/emcjs/fe/polyfills/**/*.js"), true);
    FileIndex.add(path.resolve(BUILD_PATH, "./**/i18n/fragments/**/*.js"), true);
    const config = {
        usedImports: ImportAnalyzer.getUsedImports(
            path.resolve(BUILD_PATH, "index.js"),
            path.resolve(BUILD_PATH, "_libs/emcjs/fe/util/template/HTMLTemplate.js"),
            path.resolve(BUILD_PATH, "_libs/emcjs/fe/util/template/CSSTemplate.js")
        ),
        deleteUnused: DELETE_UNUSED_FILES
    };
    FileIndex.finish(BUILD_PATH, undefined, config);
    ImageIndex.finish(BUILD_PATH, "images/_index.icons.json", /^\/images\/icons\/.*/);
    ImageIndex.finish(BUILD_PATH, "images/_index.maps.json", /^\/images\/maps\/.*/, /^\/images\/maps\/(.*)\.[^.]+$/);
    ImportAnalyzer.printUnresolvedImports();
    ImportAnalyzer.writeImportFile();
    done();
}

export const build = gulp.series(
    prepareDependencyPathRewrites,
    gulp.parallel(
        // dependencies
        copyDependencyCSS,
        copyDependencyFonts,
        copyDependencyScripts,
        buildDependencyWorker,
        // tracker
        copyTrackerI18N,
        copyTrackerI18NFragments,
        copyTrackerImg,
        // application
        copyHTML,
        copyJSON,
        copyCSS,
        copyFonts,
        copyScript
    ),
    finish
);

export const watch = function() {
    build();
    return gulp.watch(SRC_PATH, build);
};
