import React, { useEffect, useRef } from 'react';
import styles from "./rain.css"

const MakeItRain = () => {
    const rainFrontRowRef = useRef(null);
    const rainBackRowRef = useRef(null);
    const splatToggleRef = useRef(null);
    const backRowToggleRef = useRef(null);
    const singleToggleRef = useRef(null);
    
    useEffect(() => {
        const makeItRain = () => {
            // Clear out everything
            rainFrontRowRef.current.innerHTML = '';
            rainBackRowRef.current.innerHTML = '';

            let increment = 0;
            let drops = '';
            let backDrops = '';

            while (increment < 100) {
                // Couple random numbers to use for various randomizations
                // Random number between 98 and 1
                const randoHundo = Math.floor(Math.random() * (98 - 1 + 1) + 1);
                // Random number between 5 and 2
                const randoFiver = Math.floor(Math.random() * (5 - 2 + 1) + 2);
                
                // Increment
                increment += randoFiver;
                // Add in a new raindrop with various randomizations to certain CSS properties
                drops += `<div class="drop" style="left: ${increment}%; bottom: ${
                    randoFiver + randoFiver - 1 + 100
                }%; animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"><div class="stem" style="animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"></div><div class="splat" style="animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"></div></div>`;
                backDrops += `<div class="drop" style="right: ${increment}%; bottom: ${
                    randoFiver + randoFiver - 1 + 100
                }%; animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"><div class="stem" style="animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"></div><div class="splat" style="animation-delay: 0.${randoHundo}s; animation-duration: 0.5${randoHundo}s;"></div></div>`;
            }

            rainFrontRowRef.current.innerHTML = drops;
            rainBackRowRef.current.innerHTML = backDrops;
        };

        makeItRain(); // Вызываем функцию при монтировании компонента
    }, []);

    return (
        <div className={`${styles.container}  d-flex justify-content-center align-items-center bg-black vh-100`}>
            {/* rain block*/}
            <div className={`${styles.rainContainer} position-absolute w-100 h-100`}>
                <div ref={rainFrontRowRef} className={`${styles.rain} ${styles.frontRow}`}></div>
                <div ref={rainBackRowRef} className={`${styles.rain} ${styles.backRow}`}></div>
            </div>
            <div className={`${styles.formContainer} position-relative d-flex justify-content-center align-items-center`}>
                {/* Ваша форма */}
            </div>
            <div className={`${styles.toggles} position-absolute`}>
                <div className={`${styles.splatToggle} toggle active`} style={{ display: 'none' }}>SPLAT</div>
                <div className={`${styles.backRowToggle} toggle active`} style={{ display: 'none' }}>BACK<br />ROW</div>
                <div className={`${styles.singleToggle} toggle`} style={{ display: 'none' }}>SINGLE</div>
            </div>
        </div>
    );
};

export default MakeItRain;
