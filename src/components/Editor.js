import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: 'javascript', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);  // Pass the changed code to the parent component
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, [onCodeChange, roomId, socketRef]);  // Added missing dependencies

    useEffect(() => {
        const currentSocket = socketRef.current;  // Store socketRef.current in a variable

        if (currentSocket) {
            currentSocket.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);  // Update the editor with the received code
                }
            });
        }

        return () => {
            currentSocket.off(ACTIONS.CODE_CHANGE);  // Cleanup the event listener
        };
    }, [socketRef, roomId]);  // Added necessary dependencies

    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;