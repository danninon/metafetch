import React, { useState } from 'react';
import axios from 'axios';
import HealthCheck from './HealthCheck';

interface SuccessResult {
    url: string;
    title: string;
    description: string;
    image: string;
}

interface ErrorResult {
    url: string;
    status: string;
    message: string;
}

interface UrlEntry {
    url: string;
    response: SuccessResult | ErrorResult | null;
    isImage: boolean;
}

const URLAccordion: React.FC = () => {
    const [urlEntries, setUrlEntries] = useState<UrlEntry[]>([
        { url: '', response: null, isImage: false },
        { url: '', response: null, isImage: false },
        { url: '', response: null, isImage: false }
    ]);
    const [serverConnected, setServerConnected] = useState<boolean>(false);

    const handleInputChange = (index: number, value: string) => {
        const newEntries = [...urlEntries];
        newEntries[index].url = value;
        newEntries[index].isImage = /\.(jpeg|jpg|gif|png|svg)$/i.test(value);  // Reintroduce image check
        setUrlEntries(newEntries);
    };

    const handleSendAll = async () => {
        if (!serverConnected) {
            console.log("Send cancelled, server is disconnected");
            return;
        }
        const urls = urlEntries.map(entry => entry.url).filter(url => url);
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/fetch-metadata`, { urls });
            const newEntries = urlEntries.map((entry, index) => ({
                ...entry,
                response: response.data[index]
            }));
            setUrlEntries(newEntries);
        } catch (error: unknown) {  // Explicitly declare the type as unknown
            if (error instanceof Error) {
                console.error("Error in sending URLs:", error.message);
            } else {
                console.error("Error in sending URLs:", error);
            }
        }
    };

    return (
        <div>
            <HealthCheck onStatusChange={setServerConnected}/>
            {urlEntries.map((entry, index) => (
                <div key={index} className="accordion-item">
                    <input
                        type="text"
                        value={entry.url}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        placeholder="Enter URL"
                        disabled={!serverConnected}
                    />
                    {entry.response && (
                        'status' in entry.response ? (
                            <div className="error-response">
                                <strong>Error:</strong> {entry.response.status} - {entry.response.message}
                            </div>
                        ) : (
                            <div className="success-response">
                                <h4>Title: {entry.response.title}</h4>
                                <p>Description: {entry.response.description}</p>
                                <img src={entry.response.image} alt={entry.response.title} />
                            </div>
                        )
                    )}
                </div>
            ))}
            <button onClick={handleSendAll} disabled={!serverConnected || urlEntries.every(entry => !entry.url)}>Send All</button>
        </div>
    );
};

export default URLAccordion;
