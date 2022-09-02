export interface RateMeConfig {
    maxValue: number;
    iconSpacing: number;
    iconSize: number;
    allowAnimations: boolean;
    gradientFirst: string;
    gradientSecond: string;
    strokeColor: string;
    strokeStyle: string;
    withCancel: boolean;
}

export default class RateMe implements RateMeConfig {
    readonly maxValue: number = 5;
    readonly iconSpacing: number = 6;
    readonly iconSize: number = 20;
    readonly allowAnimations: boolean = true;
    readonly withCancel: boolean = false;
    readonly gradientFirst: string = "#fece3c";
    readonly gradientSecond: string = "#f5f5f5";
    readonly strokeColor: string = "transparent";
    readonly strokeStyle: string = "stroke-opacity: 0.3;";
    readonly specialCharacters: {array: string[]; use: boolean;} = {array: ["!", ".", "?", "#"], use: true};
    private readonly classes = {
        active: { emptyClass: "rateme-null-score", halfClass: "rateme-half-score", fullClass: "rateme-full-score" },
        nullish: { equalZero: "rateme-equal-zero-score", aboveZero: "rateme-above-zero-score" },
        parts: { base: "rateme-part", half: "rateme-half", full: "rateme-full" },
        base: {wrapper: "rateme-wrapper", element: "rateme-element", rating: "rateme-rating", icon: "rateme-icon", form: "rateme-form"},
        input: {empty: "rateme-empty", filled: "rateme-filled"}
    }
    private readonly attributes = {
        filter: {name: "data-rm-id", value: "rateme"},
        value: {name: "data-rm-value", value: 0},
        max: {name: "data-rm-max-value", value: 0.5},
        min: {name: "data-rm-min-value", value: 0},
        anims: {name: "data-rm-animations", value: "true"},
        size: {name: "data-rm-size", value: ""},
        ignore: {name: "data-rm-ignore", value: "true"},
    }
    private readonly svgs = {
        gradientId: "rateme-gradient",
        templateId: {
            rating: "rateme-star",
            cancel: "rateme-cancel",
        },
        paths: {
            rating: "M6.842 6.4331l-6.309.7332c-.2275.0289-.4287.1883-.5042.4306s0 .4947.1677.6541c1.8754 1.7941 4.6934 4.4808 4.6934 4.4808-.0024 0-.7736 3.9083-1.2862 6.516-.0431.236.0383.4859.2347.6353.1952.1494.4467.1519.6443.0352 2.2084-1.3158 5.5161-3.2944 5.5161-3.2944l5.5138 3.2957c.2012.1155.4527.113.6479-.0364.1964-.1494.2778-.3992.2335-.634l-1.2826-6.5172 4.6934-4.4771c.1677-.1645.2419-.4168.1677-.6579s-.2754-.4005-.503-.4281c-2.5245-.2963-6.3102-.7357-6.3102-.7357l-2.6144-6.064c-.0982-.2172-.3042-.3691-.5461-.3691s-.4491.1532-.5425.3691l-2.6144 6.064z",
            cancel: "m5.76 4.08L2.8922 5.2678 8.4243 10.8 4.08 15.84 5.2678 18.7078 10.8 13.1757 16.3322 18.7078 17.52 15.84 13.1757 10.8 18.7078 5.2678 15.84 4.08 10.8 8.4243z",
        }
    }
    constructor(config?: Partial<RateMeConfig>) {
        if(config) {
            if(config.maxValue != null && typeof config.maxValue === 'number') {
                this.maxValue = this.roundAndBound(config.maxValue, "full", 100, 1);
                delete config.maxValue;
            }
            if(config.iconSpacing != null && typeof config.iconSpacing === 'number') {
                this.iconSpacing = this.roundAndBound(config.iconSpacing, "full", 100);
                delete config.iconSpacing;
            }
            if(config.iconSize != null && typeof config.iconSize === 'number') {
                this.iconSize = config.iconSize;
                delete config.iconSize;
            }
            if(config.allowAnimations != null && typeof config.allowAnimations === 'boolean') {
                this.allowAnimations = config.allowAnimations;
                delete config.allowAnimations;
            }
            if(config.gradientFirst != null && typeof config.gradientFirst === 'string') {
                this.gradientFirst = config.gradientFirst;
                delete config.gradientFirst;
            }
            if(config.gradientSecond != null && typeof config.gradientSecond === 'string') {
                this.gradientSecond = config.gradientSecond;
                delete config.gradientSecond;
            }
            if(config.strokeColor != null && typeof config.strokeColor === 'string') {
                this.strokeColor = config.strokeColor;
                delete config.strokeColor;
            }
            if(config.strokeStyle != null && typeof config.strokeStyle === 'string') {
                this.strokeStyle = config.strokeStyle;
                delete config.strokeStyle;
            }
            if(config.withCancel != null && typeof config.withCancel === 'boolean') {
                this.withCancel = config.withCancel;
                delete config.withCancel;
            }
            if(Object.keys(config).length > 0) {
                console.warn("class RateMe: some of the given properties were incorrect and therefore not used: ", config);
            }
        }
        this.checkAndPushTemplate("rating");
        if(this.withCancel) {
            this.checkAndPushTemplate("cancel");
        }
    }

    public rating(config: {value?: number, fromDOM?: boolean, container?: HTMLElement, filter?: {exclude?: boolean, selectors?: string[], container?: HTMLElement}}): void {
        if(!config) throw new TypeError("class RateMe: config for 'rating' method was not provided.");
        const {value, fromDOM, filter, container} = config;
        if(value == null && fromDOM == null) throw new TypeError("class RateMe: config for 'rating' method should have [value: number] or [fromDOM: boolean] property defined.");
        if(value != null && typeof value !== 'number') throw new TypeError("class RateMe: config for 'rating' method should have [value: number] or [fromDOM: boolean] property defined.");
        if(fromDOM != null && typeof fromDOM !== 'boolean') throw new TypeError("class RateMe: config for 'rating' method should have [value: number] or [fromDOM: boolean] property defined.");
        const elementConfig = { value: value ?? 0, fromDOM: fromDOM ?? false, iconSpacing: this.iconSpacing, wrapperElement: undefined, iconSize: this.iconSize };
        if(fromDOM) {
            const elements = this.findRatingElements(filter);
            this.createElementsFromDOM(elements, elementConfig);
        } else {
            if(!container || !container.tagName) throw new TypeError("class RateMe: config for 'rating' method should have [container: HTMLElement] property defined when [fromDOM !== true].");
            if(value && !Number.isNaN(value)) {
                elementConfig.value = this.roundAndBound(value);
            }
            const rating = this.createViewRating(elementConfig);
            container.appendChild(rating);
        }
    }
    public rate(input: HTMLInputElement, container: HTMLElement, id?: string, initialValue: number = 0): void {
        if(!input || input.tagName !== 'INPUT' || input.type !== 'hidden') throw new TypeError("class RateMe: [input: HTMLInputElement][type='hidden'] for 'rate' method was not provided.");
        if(!container || !container.tagName) throw new TypeError("class RateMe: [container: HTMLElement] for 'rate' method was not provided.");
        if(!id) {
            id = this.randomString();
        } 
        const wrappedRating = this.createPostRating(this.roundAndBound(initialValue));
        wrappedRating.setAttribute("id", id);
        wrappedRating.classList.add(this.classes.base.form);
        input.classList.add(initialValue > 0 ? this.classes.input.filled : this.classes.input.empty);
        wrappedRating.appendChild(input);
        this.addEventToWrapper(wrappedRating);
        this.addEventsToElements(wrappedRating);        
        container.appendChild(wrappedRating);
    }
    public clearRating(id: string, required?: boolean): void {
        const form = document.querySelector(`.${this.classes.base.element}.${this.classes.base.form}#${id}`);
        if(!form) throw new TypeError("class RateMe: [id: string] for 'clearRating' should be valid rateme-form id.");
        const elements = [...form.querySelectorAll(`.${this.classes.base.icon}`)];
        if(elements && elements.length > 0) {
            elements.forEach(element => {
                let classList = this.classes.base.icon;
                if(element.classList.contains(this.classes.nullish.aboveZero) || element.classList.contains(this.classes.nullish.equalZero)) {
                    classList += ' ' + this.classes.nullish.equalZero;
                }
                element.classList.value = classList;

            });
            const input = form.querySelector("input") as HTMLInputElement;
            if(input) {
                input.classList.value = this.classes.input.empty;
                input.value = required ? '0' : '';
            }
            form.setAttribute(this.attributes.value.name, '0');
            form.firstElementChild?.setAttribute(this.attributes.value.name, '0');
        } else {
            throw new TypeError(`class RateMe: Element found with id: ${id} has no supported children.`);
        }
    }
    private randomNumber(max: number) {
        return Math.round(Math.random() * max * 2) / 2
    }
    private randomString(): string {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        let string = charset.split("").sort(() => 0.5 - Math.random()).join("").substring(Math.floor(this.randomNumber(charset.length * 0.5)));
        if(this.specialCharacters.use) {
            const specialsArray = this.specialCharacters.array;
            specialsArray.forEach(char => {
                string = this.addSpecialChar(string, char, specialsArray);
            });
        }
        return string;
    }
    private addSpecialChar(string: string, char: string, specials: string[]): string {
        const randomPercent = Math.floor((Math.random() * (0.7 - 0.2) + 0.2) * 100) / 100;
        const randomIndex = Math.floor(this.randomNumber(string.length * randomPercent) + string.length * 0.15);
        if(specials.includes(string[randomIndex])) {
            return this.addSpecialChar(string, char, specials);
        } else {
            const stringArray = string.split('');
            stringArray[randomIndex] = char;
            string = stringArray.join('');
            return string;
        }
    }
    private createElementsFromDOM(
        elements: Element[],
        elementConfig: {value: number, fromDOM: boolean, iconSpacing: number, wrapperElement: Element | undefined, iconSize: number},
    ): void {
        elements.forEach((element) => {
            const value = Number(element.getAttribute(this.attributes.value.name));
            if (!Number.isNaN(value)) {
                const roundedValue = this.roundAndBound(value);
                if (roundedValue !== value) {
                    element.setAttribute(this.attributes.value.name, roundedValue.toString());
                }
                elementConfig.value = roundedValue;
                elementConfig.wrapperElement = element;
            }
            const rating = this.createViewRating(elementConfig);
            element.appendChild(rating);
        });
    }
    private createViewRating(config: {value: number, fromDOM: boolean, iconSpacing: number, wrapperElement: Element | undefined, iconSize: number}) {
        const { value, fromDOM, iconSpacing, wrapperElement, iconSize } = config;
        const ratingWrapper = this.createWrapper(iconSpacing);
        let size = iconSize;
        if (fromDOM && wrapperElement) {
            const sizeAttr = Number(wrapperElement.getAttribute(this.attributes.size.name));
            if (sizeAttr) {
                size = sizeAttr;
            }
        }
        for (let i = 1; i <= this.maxValue; i++) {
            const activeClass = this.getActiveClass(i, value);
            ratingWrapper.appendChild(this.createSingleViewRating(size, activeClass));
        }
        if (!fromDOM) {
            return this.wrapRating(ratingWrapper, value, !fromDOM);
        }
        return ratingWrapper;
    }
    private createSingleViewRating(iconSize: number, activeClass: string): SVGSVGElement {
        const svgCreator = new RateMeSVG(this.svgs);
        const svgElement = svgCreator.createSVG({iconSize, strokeOptions: {strokeColor: this.strokeColor, style: this.strokeStyle}, iconClass: [this.classes.base.icon, activeClass], svgType: "rating"});
        return svgElement;
    }
    private createWrapper(iconSpacing: number) {
        const ratingWrapper = document.createElement("div");
        ratingWrapper.classList.add(this.classes.base.wrapper);
        ratingWrapper.style.gap = `${iconSpacing}px`;
        return ratingWrapper;
    }
    private findRatingElements(filter?: {exclude?: boolean, selectors?: string[], container?: HTMLElement}): Element[] {
        if (filter == null) {
            const elements = document.querySelectorAll(`.${this.classes.base.element}[${this.attributes.filter.name}]:not([${this.attributes.ignore.name}])`);
            return Array.from(elements);
        }
        return [...this.getFilteredElements(filter)];
    }
    private getFilteredElements(filter: {exclude?: boolean, selectors?: string[], container?: HTMLElement}): Element[] {
        const { exclude, selectors, container } = filter;
        const containerElement = container ?? document;
        if(selectors && selectors.length > 0) {
            if(exclude) {
                return this.excludeQuery(containerElement, selectors);
            } else {
                return this.includeQuery(containerElement, selectors);
            }
        } else {
            const elements = containerElement.querySelectorAll(`.${this.classes.base.element}[${this.attributes.value.name}]:not([${this.attributes.ignore.name}])`);
            return Array.from(elements);
        }
    }
    private excludeQuery(container: Document | Element, selectors: string[]): Element[] {
        const ratingElements = Array.from(container.querySelectorAll(`.${this.classes.base.element}[${this.attributes.value.name}]:not([${this.attributes.ignore.name}])`));
        const excludedRatingElements = ratingElements.filter((element) => {
            const elementRating = element.getAttribute(this.attributes.filter.name) ?? this.attributes.value.value.toString();
            return selectors.indexOf(elementRating) === -1;
        });
        return excludedRatingElements;
    }
    private includeQuery(container: Document | Element, selectors: string[]): Element[] {
        const elements = [];
        for (const id of selectors) {
            if (id === this.attributes.filter.value) {
                const unspecifiedQuery = `.${this.classes.base.element}[${this.attributes.value.name}]:not([${this.attributes.ignore.name}]):not([${this.attributes.filter.name}])`;
                const unspecifiedItems = container.querySelectorAll(unspecifiedQuery);
                if (unspecifiedItems) {
                    elements.push(...Array.from(unspecifiedItems));
                }
            }
            const selector = `.${this.classes.base.element}[${this.attributes.value.name}][${this.attributes.filter.name}="${id}"]`;
            const queryItems = container.querySelectorAll(selector);
            if (!queryItems) continue;
            elements.push(...Array.from(queryItems));
        }
        return elements;
    }
    private createPostRating(initialValue: number): HTMLDivElement {
        const ratingWrapper = this.createWrapper(this.iconSpacing);
        ratingWrapper.classList.add(this.classes.base.wrapper);
        ratingWrapper.style.gap = `${this.iconSpacing}px`;
        const startingPosition = !this.withCancel ? 1 : 0;
        for (let i = startingPosition; i <= this.maxValue; i++) {
            const isCancel = this.withCancel && i === 0;
            const activeClass = this.getActiveClass(i, initialValue, isCancel);
            const currSVG = {
                iconSize: this.iconSize,
                iconClass: [this.classes.base.icon, activeClass]
            };
            const minValue = i > 0.5 ? i - 0.5 : i;
            const ratingElement = this.createSingleRating(i, minValue, { ...currSVG, svgType: isCancel ? "cancel" : "rating" });
            ratingWrapper.appendChild(ratingElement);
        }

        return this.wrapRating(ratingWrapper, initialValue, true);
    }
    private addEventsToElements(wrappedRating: HTMLDivElement): void {
        const ratingElements = wrappedRating.querySelectorAll(`.${this.classes.parts.base}`);
        ratingElements.forEach((element) => {
            element.addEventListener("click", (e) => {
                this.elementEventHandler(e, wrappedRating);
            });
            element.addEventListener("mouseover", (e) => {
                this.elementEventHandler(e);
            });
        });
    }
    private elementEventHandler(event: Event, wrappedRating?: HTMLDivElement): void {
        const targetElement = event.target as HTMLDivElement;
        if (!targetElement) return;
        const score = Number(targetElement.getAttribute(this.attributes.value.name));
        if (score == null || Number.isNaN(score)) return;
        const wrapper = this.findWrapper(targetElement);
        if (wrapper) {
            this.handleSVGClasses(score, wrapper);
        }
        if (wrappedRating) {
            this.selectRating(score, wrappedRating);
        }
    }
    private findWrapper(targetElement: HTMLDivElement): HTMLDivElement | undefined {
        const ratingElement = targetElement.parentNode as HTMLDivElement;
        if (!ratingElement) return;
        const wrapperElement = ratingElement.parentNode as HTMLDivElement;
        if (!wrapperElement) return;
        return wrapperElement;
    }
    private selectRating(score: number, wrapperElement: HTMLDivElement): void {
        const { empty, filled } = this.classes.input;
        const inputElement = wrapperElement.querySelector("input") as HTMLInputElement;
        if (wrapperElement && inputElement) {
            wrapperElement.setAttribute(this.attributes.value.name, score.toString());
            inputElement.classList.remove(score > 0 ? empty : filled);
            inputElement.classList.add(score > 0 ? filled : empty);
            const ratedEvent = new CustomEvent("rated", {detail: score});
            const inputValue = score > 0 ? score : this.withCancel ? "" : 0;
            inputElement.dispatchEvent(ratedEvent);
            inputElement.value = inputValue.toString();
        }
    }
    private addEventToWrapper(wrappedRating: HTMLDivElement): void {
        wrappedRating.addEventListener("mouseleave", (_) => {
            const score = Number(wrappedRating.getAttribute(this.attributes.value.name));
            if (score != null && !Number.isNaN(score)) {
                this.handleSVGClasses(score, wrappedRating);
            }
        });
    }
    private handleSVGClasses(score: number, wrapper: HTMLDivElement): void {
        const { emptyClass, halfClass, fullClass } = this.classes.active;
        const ratings = Array.from(wrapper.querySelectorAll(`div.${this.classes.base.rating}`));
        ratings.forEach((rating) => {
            const lowerBound = Number(rating.getAttribute(this.attributes.min.name));
            const upperBound = Number(rating.getAttribute(this.attributes.max.name));
            const iconElement = rating.querySelector(`.${this.classes.base.icon}`);
            if (!iconElement) return;
            if (lowerBound === 0) {
                const { aboveZero, equalZero } = this.classes.nullish;
                iconElement.classList.remove(score > 0 ? equalZero : aboveZero);
                iconElement.classList.add(score > 0 ? aboveZero : equalZero);
            } else {
                const activeClass = score >= upperBound ? fullClass : score === lowerBound ? halfClass : emptyClass;
                if (!iconElement.classList.contains(activeClass)) {
                    iconElement.classList.remove(emptyClass, halfClass, fullClass);
                    iconElement.classList.add(activeClass);
                }
            }
        });
    }
    private createSingleRating(maxValue: number, minValue: number, svgConfig: { iconSize: number; svgType: "rating" | "cancel"; iconClass: string[]}): HTMLDivElement {
        const svgCreator = new RateMeSVG({...this.svgs});
        const svgElement = svgCreator.createSVG({...svgConfig, strokeOptions: {strokeColor: this.strokeColor, style: this.strokeStyle}});
        const element = document.createElement("div");
        element.classList.add(this.classes.base.rating);

        if (svgConfig.svgType === "rating") {
            element.setAttribute(this.attributes.min.name, minValue.toString());
            element.appendChild(this.createSelectionPart("half", minValue));
        }
        element.setAttribute(this.attributes.max.name, maxValue.toString());
        element.appendChild(svgElement);
        element.appendChild(this.createSelectionPart("full", maxValue));
        return element;
    }
    private createSelectionPart(part: "half" | "full", value: number): HTMLDivElement {
        const element = document.createElement("div");
        element.classList.add(this.classes.parts.base, this.classes.parts[part]);
        element.setAttribute(this.attributes.value.name, value.toString());
        return element;
    }
    private getActiveClass(i: number, score: number, isCancel?: boolean): string {
        if (isCancel) {
            const { aboveZero, equalZero } = this.classes.nullish;
            return score > 0 ? aboveZero : equalZero;
        }
        const { emptyClass, halfClass, fullClass } = this.classes.active;
        const scoreInt = Math.floor(score);
        const hasEndingHalf = score - scoreInt === 0.5;
        const isScored = this.isScored(scoreInt, score, i, hasEndingHalf);
        const isHalf = hasEndingHalf && i === scoreInt + 1;
        return isScored ? (isHalf ? halfClass : fullClass) : emptyClass;
    }
    private isScored(scoreInt: number, score: number, i: number, hasEndingHalf: boolean): boolean {
        return (score > 0 && i <= scoreInt && !hasEndingHalf) || (score > 0 && i <= scoreInt + 1 && hasEndingHalf);
    }
    private wrapRating(element: HTMLDivElement, value: number, addFilter: boolean) {
        const ratingElement = document.createElement("div");
        ratingElement.classList.add(this.classes.base.element);
        ratingElement.setAttribute(this.attributes.value.name, value.toString());
        if(addFilter) {
            ratingElement.setAttribute(this.attributes.ignore.name, this.attributes.ignore.value);
        }
        if (this.allowAnimations) {
            ratingElement.setAttribute(this.attributes.anims.name, "true");
        }
        ratingElement.appendChild(element);
        return ratingElement;
    }
    private checkAndPushTemplate(templateString: "rating" | "cancel" ): void {
        const templateDOM = document.querySelector(`symbol#${this.svgs.templateId[templateString]}`);
        if (!templateDOM) {
            const svgCreator = new RateMeSVG({...this.svgs});
            const template = svgCreator.createSVGTemplate({ svgType: templateString, gradientColors: {firstColor: this.gradientFirst, secondColor: this.gradientSecond} });
            document.body.appendChild(template);
        }
    }
    private roundAndBound(value: number, rounding: "half" | "full" = "half", maxValue: number = this.maxValue, minValue: number = 0): number {
        if (value <= minValue) return minValue;
        if (value > maxValue) return maxValue;
        return rounding === "half" ? Math.round(value * 2) / 2 : Math.round(value);
    }
}

class RateMeSVG {
    readonly SVGN = "http://www.w3.org/2000/svg";
    readonly paths;
    readonly templateId;
    readonly gradientId;
    constructor(options: {gradientId: string, templateId: {rating: string, cancel: string}, paths: {rating: string, cancel: string}}) {
        this.gradientId = options.gradientId;
        this.templateId = options.templateId;
        this.paths = options.paths;
    }

    public createSVG(options: {svgType: "rating" | "cancel", iconSize: number, iconClass: string[], strokeOptions: {strokeColor: string, style: string}}): SVGSVGElement {
        const svgElement = document.createElementNS(this.SVGN, "svg");
        svgElement.setAttribute("xmlns", this.SVGN);
        const { svgType, iconClass, iconSize, strokeOptions } = options;
        svgElement.classList.add(...iconClass);
        svgElement.setAttribute("width", `${iconSize}px`);
        svgElement.setAttribute("height", `${iconSize}px`);
        const mainUse = this.createUse({ svgType });
        svgElement.appendChild(mainUse);
        if (svgType === "rating") {
            const strokeUse = this.createUse({ svgType, strokeOptions });
            svgElement.appendChild(strokeUse);
        }
        return svgElement;
    }

    public createSVGTemplate(config: {svgType: "rating" | "cancel", gradientColors?: {firstColor: string, secondColor: string}}): SVGSVGElement {
        const svgElement = document.createElementNS(this.SVGN, "svg");
        svgElement.setAttribute("xmlns", this.SVGN);
        const { svgType, gradientColors } = config;
        svgElement.setAttribute("height", "0");
        svgElement.setAttribute("width", "0");
        if (svgType === "rating" && gradientColors) {
            const defs = document.createElementNS(this.SVGN, "defs");
            const { firstColor, secondColor } = gradientColors;
            defs.appendChild(this.createGradientElement(firstColor, secondColor));
            svgElement.appendChild(defs);
        }
        const symbol = this.createSymbolElement(this.templateId[svgType]);
        symbol.appendChild(this.createPathElement(this.paths[svgType]));
        svgElement.appendChild(symbol);
        return svgElement;
    }

    private createUse(
        config: {svgType: "rating" | "cancel", strokeOptions?: {strokeColor: string, style: string}}): SVGUseElement {
        const { svgType, strokeOptions } = config;
        const use = document.createElementNS(this.SVGN, "use");
        use.setAttribute("href", `#${this.templateId[svgType]}`);
        if (svgType === "rating" && strokeOptions != null) {
            use.setAttribute("fill", "none");
            use.setAttribute("stroke", strokeOptions.strokeColor);
            use.setAttribute("style", strokeOptions.style);
        }
        return use;
    }
    private createPathElement(d: string): SVGPathElement {
        const path = document.createElementNS(this.SVGN, "path");
        path.setAttribute("d", d);
        return path;
    }
    private createSymbolElement(id: string, viewBox: string = "0 0 20 20"): SVGSymbolElement {
        const symbol = document.createElementNS(this.SVGN, "symbol");
        symbol.setAttribute("xmlns", this.SVGN);
        symbol.setAttribute("viewBox", viewBox);
        symbol.setAttribute("id", id);
        return symbol;
    }
    private createStopElement(offset: string, color: string): SVGStopElement {
        const stop = document.createElementNS(this.SVGN, "stop");
        stop.setAttribute("offset", offset);
        stop.setAttribute("style", `stop-color:${color};stop-opacity:1`);
        return stop;
    }
    private createGradientElement(firstColor: string, secondColor: string): SVGLinearGradientElement {
        const gradient = document.createElementNS(this.SVGN, "linearGradient");
        gradient.setAttribute("id", this.gradientId);
        gradient.setAttribute("x1", "0%");
        gradient.setAttribute("y1", "0%");
        gradient.setAttribute("x2", "100%");
        gradient.setAttribute("y2", "0%");
        gradient.appendChild(this.createStopElement("0%", firstColor));
        gradient.appendChild(this.createStopElement("50%", firstColor));
        gradient.appendChild(this.createStopElement("50%", secondColor));
        gradient.appendChild(this.createStopElement("100%", secondColor));
        return gradient;
    }
}
