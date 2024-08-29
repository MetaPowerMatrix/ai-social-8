import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './MobileFramework.module.css';

const MobileFramework = ({name}) => {
    const headerRef = useRef(null);
    const promptInputRef = useRef(null);

    useEffect(() => {
        gsap.from(headerRef.current, { y: -50, opacity: 0, duration: 1 });
        gsap.from(promptInputRef.current, { y: 50, opacity: 0, duration: 1 });
        gsap.from(".recent-item", {
            opacity: 0,
            stagger: 0.2,
            y: 50,
            duration: 1,
            delay: 1
        });
    }, []);

    // useEffect(() => {
    //     gsap.from(headerRef.current, { y: -50, opacity: 0, duration: 1 });
    //     gsap.from(promptInputRef.current, { y: 50, opacity: 0, duration: 1 });
    // }, []);

    return (
        <div className={styles.content}>
            <header className={styles.app_header} ref={headerRef}>
                <h1>{name}</h1>
                <button className={styles.get_pro}>Get a Pro</button>
            </header>

            <div className={styles.input_section}>
                <input
                    ref={promptInputRef}
                    type="text"
                    placeholder="Enter your prompt here..."
                    className={styles.prompt_input}
                />
                <div className={styles.style_options}>
                    <button className={styles.add_image_btn}>Add Image</button>
                    <select className={styles.style_select}>
                        <option value="default">Style</option>
                        <option value="cartoon">Cartoon</option>
                        <option value="realistic">Realistic</option>
                    </select>
                </div>
                <button className={styles.generate_btn}>Generate</button>
            </div>
        </div>
    );
};

export default MobileFramework;
