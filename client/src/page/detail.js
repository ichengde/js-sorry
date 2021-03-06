
import React, { useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { SourceMapConsumer } from 'source-map';
import { getDetail, getRead } from "../data";
import './detail.css';

export function DetailPage() {
    let { id } = useParams();
    let [content, setContent] = useState(null);
    let [sourceContent, setSourceContent] = useState(null);

    useEffect(() => {
        if (!content) {
            getDetail(id).then(r => {
                setContent(r.data);
            })
        }
    })

    return content ? <div className="error-stack">

        <div>
            {content.project}  {content.version}
        </div>

        <div>
            {content.location}
        </div>

        <div>
            {content.userAgent}
        </div>

        <div>
            {Array.isArray(content.error.msg) ? content.error.msg.map((errorLineMessage, idx) => <div key={idx} onClick={() => {
                setSourceContent(null);
                const lineMatch = errorLineMessage.match(/\d+\:\d+/);
                if (!lineMatch) {
                    setSourceContent(null);

                    console.info('不符预期 无分隔行数');
                    return;
                }

                const lineColAr = lineMatch[0].split(':');
                const queryLineCount = lineColAr[0];
                const queryColCount = lineColAr[1];

                const start = errorLineMessage.lastIndexOf('/') + 1;
                const end = errorLineMessage.indexOf('.js') + 3;

                const fileName = errorLineMessage.slice(start, end);

                getRead(
                    content.project,
                    content.version,
                    fileName
                ).then((rawSourceMap) => {
                    if (rawSourceMap === 'no such file') {
                        setSourceContent(rawSourceMap);

                        return;
                    }

                    SourceMapConsumer.initialize({
                        "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm"
                    });

                    new SourceMapConsumer(rawSourceMap).then((consumer) => {
                        const position = consumer.originalPositionFor({
                            line: parseInt(queryLineCount),
                            column: parseInt(queryColCount)
                        })

                        console.log(position)

                        const sourceIndex = consumer.sources.findIndex(i => i === position.source);
                        const souceMapContent = consumer.sourcesContent[sourceIndex];

                        if (souceMapContent) {
                            let a1 = souceMapContent.split('\n');
                            a1.splice(position.line + 1, 0, '---------------------------------------------------------------------------------------------------- error');
                            const a2 = a1.join('\n');

                            setSourceContent(a2);
                        } else {
                            setSourceContent('解析出错');
                        }

                        consumer.destroy();
                    });


                }, (err) => {
                    setSourceContent('error', err);
                });

            }}>{errorLineMessage.replace('@', ` (at `)}</div>) : <div>{content.error.msg}</div>}
        </div>

        {sourceContent ? <pre>
            {sourceContent}
        </pre> : <div></div>}


        <div>
            {content.store.map((i, idx) => <div key={idx} className="store-log-stack">
                <div>{i.logType}</div>
                <div>{JSON.stringify(i.logs)}</div>
            </div>)}
            {/* <div></div> */}
        </div>
    </div> : <div></div>;
}
