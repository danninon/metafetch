import React, { useEffect, useState } from 'react';

interface HealthCheckProps {
    onStatusChange: (isHealthy: boolean) => void;
}

const HealthCheck: React.FC<HealthCheckProps> = ({ onStatusChange }) => {
    const [healthStatus, setHealthStatus] = useState<string>('Checking server health...');

    useEffect(() => {
        console.log("HealthCheck: Starting health check...");
        const checkHealth = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/health`);
                const data = await response.json();
                console.log("HealthCheck: Received response", response);
                if (response.ok) {
                    setHealthStatus(`Server status: ${data.message}`);
                    console.log("HealthCheck: Server is healthy", data.message);
                    onStatusChange(true);
                } else {
                    throw new Error(data.message);
                }
            } catch (error: any) {
                setHealthStatus(`Error checking server health: ${error.message}`);
                console.error("HealthCheck: Error", error.message);
                onStatusChange(false);
            }
        };

        checkHealth();
    }, [onStatusChange]);

    return (
        <div>
            <h4>{healthStatus}</h4>
        </div>
    );
};

export default HealthCheck;
