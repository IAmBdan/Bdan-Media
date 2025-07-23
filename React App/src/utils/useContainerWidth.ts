import { useState, useEffect } from 'react';

const useContainerWidth = (): number => {
    const [containerWidth, setContainerWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setContainerWidth(window.innerWidth);

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return containerWidth;
};

export default useContainerWidth;
