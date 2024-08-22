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
            return;
        }

        const urls = urlEntries.map(entry => entry.url || "placeholder");
        const placeholderCount = urls.filter(url => url === "placeholder").length;

        if (urls.length - placeholderCount < 3) {
            alert("You must provide 3 or more URL's");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/fetch-metadata`, { urls });
            const newEntries = urlEntries.map((entry, index) => {
                if (urls[index] === "placeholder") {
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
                console.error("Unexpected error:", error.message || error);
            }
        }
    };

    return (
        <div className="container">
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
            <button className="add-button" onClick={handleAddEntry}>+</button>
            <button className="send-button" onClick={handleSendAll} disabled={!serverConnected || urlEntries.every(entry => !entry.url)}>Send All</button>
        </div>
    );

};

export default URLAccordion;
