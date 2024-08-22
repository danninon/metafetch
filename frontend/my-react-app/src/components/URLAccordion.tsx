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
        { url: '', response: null, isImage: false }
    ]);
    const [serverConnected, setServerConnected] = useState<boolean>(false);

    const handleInputChange = (index: number, value: string) => {
        const newEntries = [...urlEntries];
        newEntries[index].url = value;
        newEntries[index].isImage = /\.(jpeg|jpg|gif|png|svg)$/i.test(value);
        setUrlEntries(newEntries);
    };

    const handleAddEntry = () => {
        setUrlEntries([...urlEntries, { url: '', response: null, isImage: false }]);
    };

    const handleRemoveEntry = (index: number) => {
        const newEntries = urlEntries.filter((_, i) => i !== index);
        setUrlEntries(newEntries);
    };

    const handleSendAll = async () => {
        if (!serverConnected) {
            console.log("Send cancelled, server is disconnected");
            return;
        }

        const urls = urlEntries.map(entry => entry.url || "placeholder");
        console.log(urls);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/fetch-metadata`, { urls });
            console.log(response);

            const newEntries = urlEntries.map((entry, index) => {
                console.log("7");
                if (urls[index] === "placeholder") {
                    console.log("5");
                    return {
                        ...entry,
                        response: {
                            url: entry.url,
                            status: "Error",
                            message: "You cannot send an empty line"
                        } as ErrorResult
                    };
                }
                return {
                    ...entry,
                    response: response.data[index]
                };
            });

            setUrlEntries(newEntries);

        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.results) {
                const newEntries = urlEntries.map((entry, index) => {
                    if (urls[index] === "placeholder") {
                        console.log(3);
                        return {
                            ...entry,
                            response: {
                                url: entry.url,
                                status: "Error",
                                message: "You cannot send an empty line"
                            } as ErrorResult
                        };
                    }
                    return {
                        ...entry,
                        response: error.response.data.results[index]
                    };
                });
                setUrlEntries(newEntries);
            } else {
                console.log(4);
                console.error("Unexpected error:", error.message || error);
            }
        }
    };

    return (
        <div>
            <HealthCheck onStatusChange={setServerConnected} />
            {urlEntries.map((entry, index) => (
                <div key={index} className="accordion-item">
                    <input
                        type="text"
                        value={entry.url}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        placeholder="Enter URL"
                        disabled={!serverConnected}
                    />
                    <button onClick={() => handleRemoveEntry(index)} disabled={urlEntries.length === 1}>-</button>
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
            <button onClick={handleAddEntry}>+</button>
            <button onClick={handleSendAll} disabled={!serverConnected || urlEntries.every(entry => !entry.url)}>Send All</button>
        </div>
    );
};

export default URLAccordion;
