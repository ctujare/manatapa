import React, { useEffect, useRef, useState } from 'react';
import localFont from 'next/font/local';
import Header from '@/Components/Header';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebaseConfig';
import Footer from '@/Components/Footer';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Link from 'next/link';

const roslindaleFont = localFont({
    src: '../fonts/Roslindale-DisplayNarrowRegular-Testing.ttf',
    weight: '400',
    style: 'normal',
    variable: '--font-roslindale',
});
const mapNumberRange = (n, a, b, c, d) => {
    return ((n - a) * (d - c)) / (b - a) + c;
};

const initCard = (card) => {
    const cardContent = card.querySelector('.card__content');
    const gloss = card.querySelector('.card__gloss');

    requestAnimationFrame(() => {
        gloss.classList.add('card__gloss--animatable');
    });

    const handleMouseMove = (e) => {
        const pointerX = e.clientX;
        const pointerY = e.clientY;
        const cardRect = card.getBoundingClientRect();
        const halfWidth = cardRect.width / 2;
        const halfHeight = cardRect.height / 2;
        const cardCenterX = cardRect.left + halfWidth;
        const cardCenterY = cardRect.top + halfHeight;
        const deltaX = pointerX - cardCenterX;
        const deltaY = pointerY - cardCenterY;
        const distanceToCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = Math.max(halfWidth, halfHeight);
        const degree = mapNumberRange(distanceToCenter, 0, maxDistance, 0, 10);
        const rx = mapNumberRange(deltaY, 0, halfWidth, 0, 1);
        const ry = mapNumberRange(deltaX, 0, halfHeight, 0, 1);
        // cardContent.style.transform = `perspective(400px) rotate3d(${-rx}, ${ry}, 0, ${degree}deg)`;
        gloss.style.transform = `translate(${-ry * 100}%, ${-rx * 100}%) scale(2.4)`;
        gloss.style.opacity = `${mapNumberRange(distanceToCenter, 0, maxDistance, 0, 0.6)}`;
    };

    const handleMouseLeave = () => {
        cardContent.style = null;
        gloss.style.opacity = 0;
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
    };
};
function HomePage() {
    gsap.registerPlugin(ScrollTrigger);

    const [videoLinks, setVideoLinks] = useState([]);
    const [zoomoutImages, setZoomImages] = useState([]);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const videoRef = useRef(null);
    const textRef = useRef(null);

    const homepageVideoCollectionRef = collection(db, 'homepageVideo');
    const homepageZoomOutImagesCollectionRef = collection(db, 'homepageZoomOutImages');

    const fetchVideoData = async () => {
        try {
            const querySnapshot = await getDocs(homepageVideoCollectionRef);
            const links = querySnapshot.docs.map(doc => doc.data());
            setVideoLinks(links[0]);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    const fetchZoomOutImages = async () => {
        try {
            const querySnapshot = await getDocs(homepageZoomOutImagesCollectionRef);
            const links = querySnapshot.docs.map(doc => doc.data());
            setZoomImages(links[0]);
        } catch (error) {
            console.error('Error fetching data: ', error);
        }
    };

    useEffect(() => {
        fetchVideoData();
        fetchZoomOutImages();
    }, []);

    // useEffect(() => {
    //     if (isVideoLoaded) {// Zoom video on load
    //         gsap.fromTo(
    //             videoRef.current,
    //             { scale: 0.5, transformOrigin: 'center center' },
    //             { scale: 1, duration: 1, ease: 'power2.out' }
    //         );
    //     }
    // }, []);
    // useEffect(() => {
    //     // Apply the ScrambleText animation to the text element
    //     gsap.fromTo(
    //         textRef.current,
    //         { opacity: 0 }, // Initial state
    //         {
    //             opacity: 1, // End state
    //             duration: 2,
    //             scrambleText: {
    //                 text: "Your, Majestic Matrimonial Miracles.", // The target text
    //                 chars: "lowerCase", // Scramble effect with lowercase letters
    //                 speed: 0.6, // Speed of the scramble
    //             },
    //             scrollTrigger: {
    //                 trigger: textRef.current,
    //                 start: 'top 80%', // Start when the text is 80% into the viewport
    //                 end: 'bottom 50%',
    //                 scrub: 1, // Smooth scrubbing effect
    //             },
    //         }
    //     );
    // }, []);
    const main = useRef(); // Reference for the container element
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        // Helper function to calculate scroll progress
        const calculateScrollProgress = (element) => {
            const rect = element.getBoundingClientRect();
            const elementTop = rect.top;
            const elementHeight = rect.height;
            const windowHeight = window.innerHeight;

            // Calculate the scroll progress as a value between 0 and 1
            const scrollProgress = Math.min(Math.max((windowHeight - elementTop) / (windowHeight + elementHeight), 0), 1);
            return scrollProgress;
        };

        // Adjust thresholds for mobile vs laptop
        const isMobile = window.innerWidth <= 768;
        const threshold = isMobile ? 0.05 : 0.2;  // Trigger earlier on mobile (10%) and normal on larger screens (20%)

        // Scroll-triggered animation for left and right images
        const leftImages = document.querySelectorAll('.left-image');
        const rightImages = document.querySelectorAll('.right-image');

        // Function to handle scrolling and animate based on progress
        const handleScroll = () => {
            leftImages.forEach(image => {
                const scrollProgress = calculateScrollProgress(image);

                // Animate the left image based on scroll progress
                image.style.transform = isMobile
                    ? `translateX(${(0.01 - scrollProgress) * 300}px)`
                    : `translateX(${(0.5 - scrollProgress) * 200}px)`;

                // Set opacity: if scrollProgress >= threshold, set opacity to 1
                image.style.opacity = scrollProgress >= threshold ? 1 : scrollProgress / threshold;
            });

            rightImages.forEach(image => {
                const scrollProgress = calculateScrollProgress(image);

                // Animate the right image based on scroll progress
                image.style.transform = isMobile
                    ? `translateX(${(scrollProgress - 0.01) * 300}px)`
                    : `translateX(${(scrollProgress - 0.5) * 200}px)`;

                // Set opacity: if scrollProgress >= threshold, set opacity to 1
                image.style.opacity = scrollProgress >= threshold ? 1 : scrollProgress / threshold;
            });

            const cardEffect = document.querySelector('.homepagesection5');
            const children_div = document.querySelectorAll('.tiltingcardeffect>div');
            const children = document.querySelectorAll('.tiltingcardeffect img');

            cardEffect.addEventListener('mousemove', (e) => {
                const rect = cardEffect.getBoundingClientRect();
                const x = e.clientX - rect.left; // Mouse position relative to cardEffect
                const y = e.clientY - rect.top;

                children_div.forEach((children, index) => {
                    const offsetX = ((x / rect.width) - 0.5) * 20 * (index + 1); // Adjust strength per child
                    const offsetY = ((y / rect.height) - 0.5) * 20 * (index + 1);

                    //translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(-0.29216deg) rotateY(-1.80592deg) rotateZ(0deg) skew(0deg, 0deg)
                    // child.style.transform = `translate3d(${offsetX}px, ${offsetY}px, ${index * 10}px) scale3d(1, 1, 1) rotateX(${offsetX}deg) rotateY(${offsetY}deg) rotateZ(0deg) skew(0deg, 0deg)`;
                    children.style.overflow = 'hidden';
                    children.style.transition = "all 0.2s";
                    children.style.transform = `translate3d(0px, 0px, 0px) scale(1) rotateX(${offsetX/2}deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)`;
                });

                // Calculate the translate3d values for each child
                children.forEach((child, index) => {
                    const offsetX = ((x / rect.width) - 0.5) * 20 * (index + 1); // Adjust strength per child
                    const offsetY = ((y / rect.height) - 0.5) * 20 * (index + 1);

                    //translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(-0.29216deg) rotateY(-1.80592deg) rotateZ(0deg) skew(0deg, 0deg)
                    // child.style.transform = `translate3d(${offsetX}px, ${offsetY}px, ${index * 10}px) scale3d(1, 1, 1) rotateX(${offsetX}deg) rotateY(${offsetY}deg) rotateZ(0deg) skew(0deg, 0deg)`;
                    child.style.transition = "all 0.2s";
                    child.style.transform = `translate3d(${offsetX}px, 0px, ${index * 10}px) scale(1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)`;
                });
            });

            cardEffect.addEventListener('mouseleave', () => {
                // Reset the children to their original position
                children_div.forEach((child) => {
                    child.style.transform = `translate3d(0, 0, 0)`;
                });
                children.forEach((child) => {
                    child.style.transform = `translate3d(0, 0, 0) scale(1)`;
                });
            });

        };

        // Debounce scroll events for smoother performance
        let debounceTimeout;
        const debouncedScroll = () => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                handleScroll();
            }, 10); // Adjust the delay if needed (10ms is usually smooth)
        };

        // Add the scroll event listener
        window.addEventListener('scroll', debouncedScroll);

        // Initial call to set the positions correctly
        handleScroll();

        // Clean up the event listener when the component unmounts
        return () => {
            window.removeEventListener('scroll', debouncedScroll);
            clearTimeout(debounceTimeout);
        };
    }, [isMounted]);


    useEffect(() => {
        const video = videoRef.current;

        const handleVideoLoad = () => {
            video.classList.add("loaded");

            setIsVideoLoaded(true);

            // Trigger GSAP animation
            gsap.fromTo(
                video,
                { scale: 0, transformOrigin: "center center" },
                { scale: 1, duration: 1, ease: "power2.out" }
            );
        };

        // Add event listener to ensure animation starts only when video is loaded
        if (video) {
            if (video.readyState >= 2) {
                // Video is already loaded
                handleVideoLoad();
            } else {
                video.addEventListener("loadeddata", handleVideoLoad);
            }
        }

        // Cleanup event listener on component unmount
        return () => {
            if (video) {
                video.removeEventListener("loadeddata", handleVideoLoad);
            }
        };
    }, []);
    useEffect(() => {
        // fetchMotions();

        // Initialize the 3D effect on each card
        const cardElements = document.querySelectorAll('.card');
        cardElements.forEach((cardEl) => initCard(cardEl));
    }, [isMounted]);

    useEffect(() => {
        if (isVideoLoaded && textRef.current) {
            const textElement = textRef.current;

            const animateText = (element) => {
                if (!element) return;

                const words = element.innerText.split(' ');
                element.innerHTML = '';

                words.forEach((word, index) => {
                    const span = document.createElement('span');
                    span.innerText = word + ' ';
                    span.classList.add('word');
                    span.style.animationDelay = `${index * 0.2}s`;
                    element.appendChild(span);
                });
            };

            // Set a 3-second delay before animating the text
            animateText(textElement);
            const observerOptions = {
                root: null,
                threshold: 0.5,
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            if (textElement) observer.observe(textElement);
            // if (paraRef.current) observer.observe(paraRef.current);

            return () => {
                if (textElement) observer.unobserve(textElement);
                // if (paraRef.current) observer.unobserve(paraRef.current);
            };
        }
    }, [isVideoLoaded]);

    return (
        <div>
            <Header />
            <div className="homepagesection1">
                <video
                    ref={videoRef}
                    className="homepagesection1video"
                    poster={videoLinks?.thumbnail}
                    src={videoLinks?.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                >
                    Your browser does not support the video tag.
                </video>

                {isVideoLoaded && (
                    <p
                        ref={textRef}
                        className={`uppercase ${roslindaleFont.className} homepagesection1text`}
                    >
                        Your, Majestic Matrimonial Miracles.
                    </p>
                )}
            </div>
            <div className='homepagesection2'>
                <div className='text-center'>
                    <p className={`homepagesection2text  ${roslindaleFont.className}`}>Immortalizing
                        <img className='homepagesection2img' src={zoomoutImages?.image} alt="" />
                        the Profound</p>
                    <br />
                    <p className={`homepagesection2text  ${roslindaleFont.className}`}>Symphony of Love and
                        <img className='homepagesection2img' src={zoomoutImages?.image2} alt="" />
                    </p>
                    <br />
                    <p className={`homepagesection2text  ${roslindaleFont.className}`}>
                        Legacy in Each Frame.
                        <img className='homepagesection2img hidden lg:block lg:!w-[118px] lg:h-[90px]' src={zoomoutImages?.image3} alt="" />
                    </p>
                    <div className='w-full flex flex-col justify-center items-center'>
                        <p className='lg:w-[60%] w-[86%]  text-[#A80018] capitalize text-[16px] lg:text-[20px] mt-[24px] lg:mt-[72px]'>Mantapa is the heart's symphony, harmonizing the ephemeral beauty of tradition with the eternal essence of love. We sculpt memories with the delicate brushstrokes of innovation, infusing each frame with the soulful melody of cherished moments.</p>
                        <Link href={'AboutUs'} className='material-bubble lg:mt-[29px]'>Read More...</Link>
                        <Link href={'AboutUs'} className='material-bubble1 mt-[31px]'>Read More...</Link>
                    </div>
                </div>
            </div>
            <div className='' ref={main}>
                <div className="homepagesection3" >
                    <div className="absolute  lg:left-[-100px] left-[30px] h-full flex items-center">
                        <img
                            className="left-image lg:w-[600px] lg:h-[700px] w-[250px] h-[347px] object-cover rotate-[-2.8deg] rounded-[32px] z-10"
                            src="https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/Stills%2F20.jpg?alt=media&token=6bd2e88c-9ef8-4df3-94d5-28690a675296"
                            alt="Left Image"
                        />
                    </div>
                    <div className="flex flex-col justify-center items-center w-[413px]">
                        <h1
                            className={`lg:text-[84.9px] text-[26px] text-[#A80018] lg:leading-[98px] leading-[24px] font-bold text-center ${roslindaleFont.className}`}
                        >
                            Heartfelt <br className="lg:hidden block" /> Captures
                        </h1>
                        <Link href={'Stills'} className="material-bubble lg:mt-[61px] !w-max uppercase">
                            Visual archive
                        </Link>
                        <Link href={'Stills'} className="material-bubble1 mt-[24px] !w-max uppercase">
                            Visual archive
                        </Link>
                    </div>
                    <div className="absolute  lg:right-[-100px] right-[15px] h-full flex items-center">
                        <img
                            className="right-image lg:w-[600px] lg:h-[700px] w-[250px] h-[347px] object-cover rotate-[2.8deg] rounded-[32px] z-10"
                            src="https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/10be9f9f60b5813c7746dd129aea3a82.jpeg?alt=media&token=e3dd27c8-8d5b-4d5b-b10e-58bbf6b8e7cd"
                            alt="Right Image"
                        />
                    </div>
                </div>
                <div className='homepagesection4'>
                    <div className="absolute lg:left-[-100px] left-[30px] h-full flex items-center">
                        <img
                            className="left-image bg-[#DBCBD1] lg:w-[600px] lg:h-[700px] w-[250px] h-[347px] object-cover rotate-[-2.8deg] rounded-[32px] z-10"
                            src='https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/Arth%20PNG.png?alt=media&token=d0133f28-6279-49a0-b7c7-aa1ce6f96f5c'
                            alt="" />
                    </div>
                    <div className=' flex flex-col justify-center items-center w-[413px]' >
                        <p className='pb-[42px] !w-max uppercase inline-flex items-center gap-3 font-medium lg:text-[20px] text-[10px]  text-[#A80018]'>
                            NEW YORK
                            <span>
                                <svg width="27" height="13" viewBox="0 0 27 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M27 6.5L0 13L5.90104e-07 0L27 6.5Z" fill="#A80018" />
                                </svg>
                            </span>
                            LONDON
                        </p>

                        <h1 className={`lg:text-[84.9px] text-[26px]  text-[#A80018] lg:leading-[98px] leading-[24px] font-bold text-center ${roslindaleFont.className}`}>Mantapa's  <br className='lg:hidden block ' /> Visionaries</h1>
                        <Link href={'AboutUs'} className='material-bubble lg:mt-[61px] !w-max uppercase'>Visual archive</Link>
                        <Link href={'AboutUs'} className='material-bubble1 mt-[24px] !w-max uppercase'>Visual archive</Link>
                    </div>
                    <div className="absolute lg:right-[-100px] right-[15px] h-full flex items-center">
                        <img
                            className="right-image bg-[#DBCBD1] lg:w-[600px] lg:h-[700px] w-[250px] h-[347px] object-cover rotate-[2.8deg] rounded-[32px] z-10"
                            src="https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/Priyansh%20PNG%202.png?alt=media&token=6ec859b0-9f56-4b27-956f-3c884727ed94"
                            alt="Right Image"
                        />
                    </div>
                </div>
            </div>
            <div className="homepagesection5">
                <h1 className={`lg:text-[84.9px]  text-[26px] text-[#A80018] leading-[28px] lg:leading-[98px] font-bold text-center ${roslindaleFont.className}`}>
                    Films
                </h1>

                {false && <div className="card">
                    <div className="card__content">
                        <div class="card__gloss"></div>
                        <div className='homepagesection5motion tiltingcardeffect'>
                            <div className='lg:w-[780px] lg:h-[480px] w-[309px] h-[265px] z-10 rounded-lg'>
                                <a href={''} target='_blank' className="motion-cms-play">
                                    <svg width="20%" viewBox="0 0 20 23" fill="#FFF" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 9.76795C20.3333 10.5378 20.3333 12.4623 19 13.2321L3.25 22.3253C1.91667 23.0951 0.250001 22.1329 0.250001 20.5933L0.250002 2.40673C0.250002 0.867131 1.91667 -0.0951185 3.25 0.674682L19 9.76795Z" fill="#FFF"></path>
                                    </svg>
                                </a>
                                <a href={''} target='_blank' className="motion-cms-playmobile">
                                    <svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g filter="url(#filter0_b_491_185)">
                                            <rect width="52.53" height="52.7758" rx="26.265" fill="#0E1012" fill-opacity="0.5" />
                                            <path d="M32.0703 26.3968C32.7736 26.8031 32.7736 27.8189 32.0703 28.2252L23.7622 33.0249C23.0589 33.4312 22.1797 32.9233 22.1797 32.1107L22.1797 22.5113C22.1797 21.6987 23.0589 21.1908 23.7622 21.5971L32.0703 26.3968Z" fill="#F3F6FA" />
                                        </g>
                                        <defs>
                                            <filter id="filter0_b_491_185" x="-5.99999" y="-5.99999" width="64.5293" height="64.7754" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                                <feGaussianBlur in="BackgroundImageFix" stdDeviation="3" />
                                                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_491_185" />
                                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_491_185" result="shape" />
                                            </filter>
                                        </defs>
                                    </svg>

                                </a>
                                <img className='rounded-[24px] w-[309px] h-[265px] lg:w-[780px] lg:h-[480px] object-cover' src="https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/636012bd2248e8047dc4d4e4_amelia-cover-p-1080.jpg.png?alt=media&token=06b8e32b-d135-4083-9e64-630caa81caf2" alt="" />
                            </div>
                            <div className='lg:w-[247px] w-[117px] h-[77px] lg:h-[175px] absolute lg:top-[150px] lg:left-[15%] top-[40%] left-[0%] z-10 rounded-lg'>
                                <img className='lg:rounded-[24px] rounded-[10px]' src='https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/636012bd2248e8047dc4d4e4_amelia-cover-p-1080.jpg.png?alt=media&token=08b40ad0-8dca-40b0-91f3-97bd3e4bb346' alt="" />
                            </div>
                            <div className='lg:w-[223px] w-[111px] h-[77px] lg:h-[154px] absolute lg:top-[-10%] lg:right-[15%] top-[-15%] right-[0%] z-10 rounded-lg'>
                                <img className='lg:rounded-[24px] rounded-[10px] object-cover' src='https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/638dbe66153918a719590b8a_amelia-small-1%2520(1).jpg.png?alt=media&token=cd4b5333-d45d-435c-bede-c895713a40aa' alt="" />
                            </div>
                            <div className='lg:w-[223px] lg:h-[154px] w-[111px] h-[77px] absolute lg:bottom-[10%] lg:right-[20%] bottom-[-1%] right-[-0%] z-20 rounded-lg'>
                                <img className='lg:rounded-[24px] rounded-[10px] object-cover' src='https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/638dbe6fdd44deb587cacf33_amelia-small-3%2520(1).jpg.png?alt=media&token=295a4906-2dc5-4ec0-82d6-934fc5cdd97f' alt="" />
                            </div>
                        </div>
                    </div>
                </div>}
                <div className="card">
                    <div className="card__content">
                        <div className="card__gloss"></div>
                        <div className="homepagesection5motion tiltingcardeffect">
                            <div className='lg:w-[780px] lg:h-[480px] w-[309px] h-[265px] z-10 rounded-[20px]'>
                                <a href={'https://www.youtube.com/watch?v=SdW9PiqX2Nc'} target='_blank' className="motion-cms-play">
                                    <svg width="20%" viewBox="0 0 20 23" fill="#FFF" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 9.76795C20.3333 10.5378 20.3333 12.4623 19 13.2321L3.25 22.3253C1.91667 23.0951 0.250001 22.1329 0.250001 20.5933L0.250002 2.40673C0.250002 0.867131 1.91667 -0.0951185 3.25 0.674682L19 9.76795Z" fill="#FFF"></path>
                                    </svg>
                                </a>
                                <a href={''} target='_blank' className="motion-cms-playmobile">
                                    <svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g filter="url(#filter0_b_491_185)">
                                            <rect width="52.53" height="52.7758" rx="26.265" fill="#0E1012" fill-opacity="0.5" />
                                            <path d="M32.0703 26.3968C32.7736 26.8031 32.7736 27.8189 32.0703 28.2252L23.7622 33.0249C23.0589 33.4312 22.1797 32.9233 22.1797 32.1107L22.1797 22.5113C22.1797 21.6987 23.0589 21.1908 23.7622 21.5971L32.0703 26.3968Z" fill="#F3F6FA" />
                                        </g>
                                        <defs>
                                            <filter id="filter0_b_491_185" x="-5.99999" y="-5.99999" width="64.5293" height="64.7754" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                                                <feFlood flood-opacity="0" result="BackgroundImageFix" />
                                                <feGaussianBlur in="BackgroundImageFix" stdDeviation="3" />
                                                <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_491_185" />
                                                <feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_491_185" result="shape" />
                                            </filter>
                                        </defs>
                                    </svg>
                                </a>
                                <img className='rounded-[24px] w-[309px] h-[265px] lg:w-[780px] lg:h-[480px] object-cover' src={'https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/636012bd2248e8047dc4d4e4_amelia-cover-p-1080.jpg.png?alt=media&token=06b8e32b-d135-4083-9e64-630caa81caf2'} alt="" />
                            </div>
                            <div className='lg:w-[247px] w-[117px] h-[77px] lg:h-[175px] absolute lg:top-[150px] lg:left-[22%] top-[40%] left-[0%] z-10 rounded-[20px]'>
                                <img className='lg:rounded-[24px] rounded-[10px]' src={'https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/638dbe6bb55f59b65ba50249_amelia-small-2%2520(1).jpg.png?alt=media&token=be251981-7a03-4794-9485-55e85c896282'} alt="" />
                            </div>
                            <div className='lg:w-[223px] w-[111px] h-[77px] lg:h-[154px] absolute lg:top-[-16%] lg:right-[23%] top-[-15%] right-[0%] z-0 rounded-[20px]'>
                                <img className='lg:rounded-[24px] rounded-[10px] object-cover' src={'https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/638dbe66153918a719590b8a_amelia-small-1%2520(1).jpg.png?alt=media&token=cd4b5333-d45d-435c-bede-c895713a40aa'} alt="" />
                            </div>
                            <div className='lg:w-[223px] lg:h-[154px] w-[111px] h-[77px] absolute lg:bottom-[-5%] lg:right-[24%] bottom-[-1%] right-[-0%] z-20 rounded-[20px]'>
                                <img className='lg:rounded-[24px] rounded-[10px]' src={'https://firebasestorage.googleapis.com/v0/b/mantapa-22cfd.appspot.com/o/638dbe6fdd44deb587cacf33_amelia-small-3%2520(1).jpg.png?alt=media&token=295a4906-2dc5-4ec0-82d6-934fc5cdd97f'} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className='w-full flex flex-col justify-center items-center'>
                    <Link href={'Motions'} className='material-bubble lg:mt-[29px]'>WATCH VIDEOS</Link>
                    <Link href={'Motions'} className='material-bubble1 mt-[42px]'>WATCH VIDEOS</Link>

                </div>
            </div>
            <Footer />
        </div>
    )
}

export default HomePage
