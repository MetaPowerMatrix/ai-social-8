import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './AnimationAI.css'

const AnimatedAI = () => {
    const rectSizesRef = useRef({ width1: 70, height1: 30 });
    const [rectSizes, setRectSizes] = useState({
        width1: 70,
        width2: 30,
        height1: 30,
        height2: 70,
    });

    useEffect(() => {
        const updateSizes = () => {
            const { width1, height1 } = rectSizesRef.current;
            setRectSizes({
                width1: width1,
                width2: 100 - width1,
                height1: height1,
                height2: 100 - height1,
            });
        };

        // GSAP Timeline Animation
        const tl = gsap.timeline({ repeat: -1, yoyo: true });

        tl.to(rectSizesRef.current, {
            width1: 50, // Increase width of the first column, decrease the other
            height1: 50, // Decrease the height of the first row, increase the other
            duration: 2,
            ease: "power1.inOut",
            onUpdate: updateSizes,
        }).to(rectSizesRef.current, {
            width1: 70, // Reset widths and heights to original
            height1: 30,
            duration: 2,
            ease: "power1.inOut",
            onUpdate: updateSizes,
        });

        return () => {
            tl.kill(); // Clean up on component unmount
        };
    }, []);

    return (
        <div className="home-page">
            {/* Top Icon Tags Bar */}
            <div className="top-bar">
                <div className="tag">AI 1</div>
                <div className="tag">AI 2</div>
                <div className="tag">AI 3</div>
                <div className="tag">AI 4</div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                <div className="rect-wrapper">
                    <div className="rect-container">
                        <div
                            className="rect rect1"
                            style={{
                                width: `${rectSizes.width1}%`,
                                height: `${rectSizes.height1}%`,
                            }}
                        >
                            <div className="icon">Icon 1</div>
                        </div>
                        <div
                            className="rect rect2"
                            style={{
                                width: `${rectSizes.width2}%`,
                                height: `${rectSizes.height1}%`,
                            }}
                        >
                            <div className="icon">Icon 2</div>
                        </div>
                        <div
                            className="rect rect3"
                            style={{
                                width: `${rectSizes.width1}%`,
                                height: `${rectSizes.height2}%`,
                            }}
                        >
                            <div className="icon">Icon 3</div>
                        </div>
                        <div
                            className="rect rect4"
                            style={{
                                width: `${rectSizes.width2}%`,
                                height: `${rectSizes.height2}%`,
                            }}
                        >
                            <div className="icon">Icon 4</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Tab Bar */}
            <div className="bottom-bar">
                <div className="tab home-tab">Home</div>
                <div className="tab phone-tab">Phone</div>
                <div className="tab mine-tab">Mine</div>
            </div>
        </div>
    );
};

export default AnimatedAI;
