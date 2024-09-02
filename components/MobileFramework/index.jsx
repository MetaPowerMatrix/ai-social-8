import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import styles from './MobileFramework.module.css';
import {AudioOutlined} from "@ant-design/icons";

const MobileFramework = ({name}) => {
    const headerRef = useRef(null);
    const promptInputRef = useRef(null);

    useEffect(() => {
        gsap.from(headerRef.current, { y: -50, opacity: 0, duration: 1 });
        gsap.from(promptInputRef.current, { y: 50, opacity: 0, duration: 1 });
        // gsap.from(".recent-item", {
        //     opacity: 0,
        //     stagger: 0.2,
        //     y: 50,
        //     duration: 1,
        //     delay: 1
        // });
    }, []);

    return (
        <>
            <div className={styles.content}>
                <header className={styles.app_header} ref={headerRef}>
                    <h1>{name}</h1>
                    <button className={styles.get_pro}>设置</button>
                </header>

                <div className={styles.input_section}>
                    <input
                        ref={promptInputRef}
                        type="text"
                        placeholder="输入问题..."
                        className={styles.prompt_input}
                    />
                    <AudioOutlined style={{color: "black", fontSize: 20}} onClick={{}}/>
                    <div className={styles.style_options}>
                        <button className={styles.add_image_btn}>图片</button>
                        <select className={styles.style_select}>
                            <option value="default">旅行</option>
                            <option value="cartoon">特产</option>
                        </select>
                    </div>
                </div>
            </div>
            <div style={{height: 395}}/>
        </>
    );
};

export default MobileFramework;
