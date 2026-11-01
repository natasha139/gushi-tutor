const fs = require('node:fs');
const {createRequire} = require('node:module');
const req = createRequire(process.cwd() + '/package.json');
const React = req('react');
const {renderToStaticMarkup} = req('react-dom/server');
const {transformSync} = req('esbuild');
const source = fs.readFileSync('src/components/PoemDetail.tsx','utf8');
const fn = source.slice(source.indexOf('  const renderOccludedSentence'), source.indexOf('\n  return (\n    <div className="poem-detail'));
const body = source.slice(source.indexOf('                {poem.sentences_json',source.indexOf('{/* Occluded Poem Body */}')),source.indexOf('\n              </div>',source.indexOf('{/* Show Poem */}')));
const code = transformSync(`(function(poem, challengeStage) { const getFontSizeClass=()=> 'reading-text'; ${fn}; return <div>${body}</div>; })`,{loader:'tsx',jsx:'transform'}).code;
const render = new Function('React',`return ${code}`)(React);
for(const sentences_json of [undefined, [], [{text:'床前明月光，'},{text:'疑是地上霜。'}]]) {
 for(let stage=0;stage<=4;stage++) {
 const html=renderToStaticMarkup(render({raw_text:'床前明月光，疑是地上霜。',sentences_json}, stage));
 if(stage>0 && !html.includes('🙈')) throw Error(`stage ${stage}: missing mask with sentences_json=${JSON.stringify(sentences_json)}: ${html}`);
 if(stage===4 && /[床前明月光疑是地上霜]/u.test(html)) throw Error('full mask leaks original text');
 }
}
console.log('PASS: all five stages, with and without sentence analysis');
