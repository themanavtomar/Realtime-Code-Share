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
        // Initialize the CodeMirror editor
        const initEditor = () => {
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

            // Handle change event to emit code changes to the socket
            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
                }
            });
        };

        initEditor();

        return () => {
            if (editorRef.current) {
                editorRef.current.toTextArea(); // Clean up the editor
                editorRef.current = null; // Clear the reference
            }
        };
    }, [onCodeChange, roomId, socketRef]); // Added dependencies for clarity

    useEffect(() => {
        if (socketRef.current) {
            // Listen for code changes from other clients
            const handleCodeChange = ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            };

            socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

            return () => {
                socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
            };
        }
    }, [socketRef]); // Listen to changes in socketRef

    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;
