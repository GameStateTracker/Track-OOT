import path from "path";
import gulp from "gulp";
import htmlmin from "gulp-htmlmin";
import jsonminify from "gulp-jsonminify";
import svgo from "gulp-svgo";
import changed, {compareContents} from "gulp-changed";
import autoprefixer from "gulp-autoprefixer";
import FileIndex from "@zidargs/buildtools/FileIndex.js";
import LanguageManager from "@zidargs/buildtools/LanguageManager.js";
import ImportAnalyzer from "@zidargs/buildtools/ImportAnalyzer.js";
import {readJSONFile} from "@zidargs/buildtools/util/ReadJSONFile.js";
import {mergeStream} from "@zidargs/buildtools/util/MergeStream.js";
import {packScript} from "@zidargs/buildtools/PackScript.js";
import SourceImport from "@zidargs/buildtools/SourceImport.js";
import "@emcjs/fe/_build_tools/RegisterImportHandlers.js";

const __dirname = path.resolve();

const NODE_FOLDER = path.resolve(__dirname, "node_modules");

const SRC_PATH = path.resolve(__dirname, "src");
const LOGIC_PATH = path.resolve(__dirname, "logic");
const DEV_PATH = path.resolve(__dirname, "dev");
const PRD_PATH = path.resolve(__dirname, "prod");

const DEPENDENCIES = readJSONFile(path.resolve(__dirname, "build_dependencies.json"));
const SCRIPT_PATHS = [
    "script",
    "detached",
    "remote",
    "config"
];

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

function copyJS(files, src, dest, distRoot) {
    let res = gulp.src(files);
    res = res.pipe(FileIndex.register(src, dest));
    res = res.pipe(ImportAnalyzer.register(src, dest, __dirname, distRoot));
    res = res.pipe(SourceImport.compiler());
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
function prepareDependencyPathRewrites(dest = DEV_PATH, done = () => {}) {
    for (const dependency of DEPENDENCIES) {
        if ("js" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.js.src);
            const DST = `${dest}/${dependency.js.dest}`;
            ImportAnalyzer.setPathRewriteRule(SRC, DST);
        }
    }
    done();
}

/* DEPENDENCIES START */
function copyDependencyScripts(dest = DEV_PATH) {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("js" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.js.src);
            const DST = `${dest}/${dependency.js.dest}`;
            const FILES = [
                `${SRC}/**/*.js`
            ];
            result.push(copyJS(FILES, SRC, DST));
        }
    }
    return mergeStream(...result);
}

function buildDependencyWorker(dest = DEV_PATH) {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("js" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.js.src);
            const DST = `${dest}/${dependency.js.dest}`;
            const FILES = [
                `${SRC}/**/*.w.js`
            ];
            result.push(buildWorker(FILES, SRC, DST));
        }
    }
    return mergeStream(...result);
}

function copyDependencyCSS(dest = DEV_PATH) {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("css" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.css.src);
            const DST = `${dest}/${dependency.css.dest}`;
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

function copyDependencyFonts(dest = DEV_PATH) {
    const result = [];
    for (const dependency of DEPENDENCIES) {
        if ("css" in dependency) {
            const SRC = path.resolve(NODE_FOLDER, dependency.font.src);
            const DST = `${dest}/${dependency.font.dest}`;
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

function copyScripts(src = SRC_PATH, dest = DEV_PATH) {
    const result = [];
    for (const scriptPath of SCRIPT_PATHS) {
        const FILES = [
            `${src}/${scriptPath}/**/*.js`
        ];
        const SRC = `${src}/${scriptPath}`;
        const DST = `${dest}/${scriptPath}`;
        result.push(copyJS(FILES, SRC, DST, dest));
    }
    return mergeStream(...result);
}

function copyInitializer(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/sw.js`,
        `${src}/index.js`
    ];
    const SRC = src;
    const DST = dest;
    return copyJS(FILES, SRC, DST, dest);
}

function copyHTML(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/**/*.html`,
        `!${src}/script/**/*.html`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(src, dest));
    if (!REBUILD) {
        res = res.pipe(changed(dest));
    }
    res = res.pipe(htmlmin({collapseWhitespace: true}));
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyJSON(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/**/*.json`,
        `!${src}/script/**/*.json`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(src, dest));
    if (!REBUILD) {
        res = res.pipe(changed(dest));
    }
    if (!NOCOMPRESS) {
        res = res.pipe(jsonminify());
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyLogic(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${LOGIC_PATH}/**/*.min.json`
    ];
    const DST = `${dest}/logic`;
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(src, DST));
    if (!REBUILD) {
        res = res.pipe(changed(DST));
    }
    res = res.pipe(gulp.dest(DST));
    return res;
}

function copyI18N(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/i18n/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${src}/i18n`, `${dest}/i18n`));
    res = res.pipe(LanguageManager.register(`${src}/i18n`, `${dest}/i18n`));
    if (!REBUILD) {
        res = res.pipe(changed(`${dest}/i18n`));
    }
    res = res.pipe(gulp.dest(`${dest}/i18n`));
    return res;
}

function copyI18NFragments(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/i18n/fragments/**/*.js`,
        `${src}/i18n/fragments/**/*.json`,
        `${src}/i18n/fragments/**/*.lang`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${src}/i18n/fragments`, `${dest}/i18n/fragments`));
    if (!REBUILD) {
        res = res.pipe(changed(`${dest}/i18n/fragments`));
    }
    res = res.pipe(gulp.dest(`${dest}/i18n/fragments`));
    return res;
}

function copyImg(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/images/**/*.svg`,
        `${src}/images/**/*.png`,
        `${src}/images/**/*.webp`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${src}/images`, `${dest}/images`));
    if (!REBUILD) {
        res = res.pipe(changed(`${dest}/images`));
    }
    res = res.pipe(svgo());
    res = res.pipe(gulp.dest(`${dest}/images`));
    return res;
}

function copyChangelog(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/CHANGELOG.MD`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(src, dest));
    if (!REBUILD) {
        res = res.pipe(changed(dest));
    }
    res = res.pipe(gulp.dest(dest));
    return res;
}

function copyCSS(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/style/**/*.css`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${src}/style`, `${dest}/style`));
    if (!REBUILD) {
        res = res.pipe(changed(`${dest}/style`));
    }
    res = res.pipe(autoprefixer());
    res = res.pipe(gulp.dest(`${dest}/style`));
    return res;
}

function copyFonts(src = SRC_PATH, dest = DEV_PATH) {
    const FILES = [
        `${src}/fonts/**/*.ttf`,
        `${src}/fonts/**/*.eot`,
        `${src}/fonts/**/*.otf`,
        `${src}/fonts/**/*.woff`,
        `${src}/fonts/**/*.woff2`,
        `${src}/fonts/**/*.svg`
    ];
    let res = gulp.src(FILES);
    res = res.pipe(FileIndex.register(`${src}/fonts`, `${dest}/fonts`));
    if (!REBUILD) {
        res = res.pipe(changed(`${dest}/fonts`));
    }
    res = res.pipe(gulp.dest(`${dest}/fonts`));
    return res;
}

function finish(dest, done) {
    ImportAnalyzer.printUnresolvedImports();
    FileIndex.add(LanguageManager.finish(`${dest}/i18n`));
    FileIndex.add(path.resolve(dest, "_libs/emcjs/fe/polyfills/**/*.js"), true);
    FileIndex.add(path.resolve(dest, "./**/StateConverter*.js"), true);
    FileIndex.add(path.resolve(dest, "./**/i18n/fragments/**/*.js"), true);
    const config = {
        usedImports: ImportAnalyzer.getUsedImports(
            path.resolve(dest, "script/app.js"),
            path.resolve(dest, "sw.js"),
            path.resolve(dest, "index.js"),
            path.resolve(dest, "script/StateRecovery.js"),
            path.resolve(dest, "detached/index.js"),
            path.resolve(dest, "remote/itemview/index.js"),
            path.resolve(dest, "_libs/emcjs/fe/util/template/HTMLTemplate.js"),
            path.resolve(dest, "_libs/emcjs/fe/util/template/CSSTemplate.js")
        ),
        deleteUnused: DELETE_UNUSED_FILES
    };
    ImportAnalyzer.writeImportFile();
    ImportAnalyzer.writeUnresolvedImports();
    FileIndex.finish(dest, undefined, config);
    done();
}

export const build = gulp.series(
    prepareDependencyPathRewrites.bind(this, DEV_PATH),
    gulp.parallel(
        // dependencies
        copyDependencyCSS.bind(this, PRD_PATH),
        copyDependencyFonts.bind(this, PRD_PATH),
        copyDependencyScripts.bind(this, PRD_PATH),
        buildDependencyWorker.bind(this, PRD_PATH),
        // application
        copyHTML.bind(this, SRC_PATH, PRD_PATH),
        copyJSON.bind(this, SRC_PATH, PRD_PATH),
        copyLogic.bind(this, SRC_PATH, PRD_PATH),
        copyI18N.bind(this, SRC_PATH, PRD_PATH),
        copyI18NFragments.bind(this, SRC_PATH, PRD_PATH),
        copyImg.bind(this, SRC_PATH, PRD_PATH),
        copyCSS.bind(this, SRC_PATH, PRD_PATH),
        copyFonts.bind(this, SRC_PATH, PRD_PATH),
        copyScripts.bind(this, SRC_PATH, PRD_PATH),
        copyInitializer.bind(this, SRC_PATH, PRD_PATH),
        copyChangelog.bind(this, SRC_PATH, PRD_PATH)
    ),
    finish.bind(this, PRD_PATH)
);

export const buildDev = gulp.series(
    prepareDependencyPathRewrites.bind(this, DEV_PATH),
    gulp.parallel(
        // dependencies
        copyDependencyCSS.bind(this, DEV_PATH),
        copyDependencyFonts.bind(this, DEV_PATH),
        copyDependencyScripts.bind(this, DEV_PATH),
        buildDependencyWorker.bind(this, DEV_PATH),
        // application
        copyHTML.bind(this, SRC_PATH, DEV_PATH),
        copyJSON.bind(this, SRC_PATH, DEV_PATH),
        copyLogic.bind(this, SRC_PATH, DEV_PATH),
        copyI18N.bind(this, SRC_PATH, DEV_PATH),
        copyI18NFragments.bind(this, SRC_PATH, DEV_PATH),
        copyImg.bind(this, SRC_PATH, DEV_PATH),
        copyCSS.bind(this, SRC_PATH, DEV_PATH),
        copyFonts.bind(this, SRC_PATH, DEV_PATH),
        copyScripts.bind(this, SRC_PATH, DEV_PATH),
        copyInitializer.bind(this, SRC_PATH, DEV_PATH),
        copyChangelog.bind(this, SRC_PATH, DEV_PATH)
    ),
    finish.bind(this, DEV_PATH)
);

export const watch = function() {
    buildDev();
    return gulp.watch(SRC_PATH, buildDev);
};
