import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

function BSLInfoComponent() {
    const [query, setQuery] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // let voices = [];
    // let selectedVoice = null;

    // useEffect(() => {
    //     const setVoice = () => {
    //         voices = speechSynthesis.getVoices();
    //         selectedVoice = voices.find(voice => voice.lang.startsWith("en-GB") && voice.name.includes("Female"));
    //     };
    
    //     if (speechSynthesis.onvoiceschanged !== undefined) {
    //         speechSynthesis.onvoiceschanged = setVoice;
    //     } else {
    //         setVoice();
    //     }
    // }, []); // Empty array ensures this only runs on mount
    

    // const speak = (text) => {
    //     const utterance = new SpeechSynthesisUtterance(text);
    //     voices = speechSynthesis.getVoices();
    //     utterance.voice = selectedVoice || voices[0];
    //     utterance.onend = () => setIsLoading(false); // Set loading to false when done speaking
    //     speechSynthesis.cancel(); // Cancel any ongoing synthesis
    //     speechSynthesis.speak(utterance);
    // };

    const speakText = async (text) => {
        try {
            await TextToSpeech.speak({
                text: text,
                lang: 'en-GB', // Language code
                rate: 1.0,     // Speed of speech
                pitch: 1.0,    // Pitch of speech
                volume: 1.0    // Volume
            });
        } catch (error) {
            console.error('TTS error:', error);
        }
    };

    const handleQuery = async () => {
        console.log("Handling query:", query);
        setError('');
        setIsLoading(true);
    
        const functions = getFunctions();
        const provideBSLInfo = httpsCallable(functions, 'provideBSLInfo');
    
        try {
            const result = await provideBSLInfo({ query });
            console.log("Function result:", result);
            const answer = result.data?.answer || 'I do not have an answer for that.';
            setResponse(answer);
            // speak(answer);
            speakText(answer);
        } catch (error) {
            console.error('Error calling provideBSLInfo function:', error);
            setError('Sorry, there was an error processing your request.');
        } finally {
            setIsLoading(false);
        }
    };    

    return (
        <div>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask me about BSL..."
                disabled={isLoading}
            />
            <button onClick={handleQuery} disabled={isLoading || !query}>
                {isLoading ? 'Loading...' : 'Ask me!'}
            </button>
            <p>{response}</p>
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default BSLInfoComponent;
