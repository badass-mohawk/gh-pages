// Import svgMap from svg-map.js file
const svgIconsData = require('./svg-map.js');

class FeatherIcons {
	constructor(API, name, config) {
		this.API = API;
		this.name = name;
		this.config = config;

		this.API.addModifier('htmlOutput', this.modifyHTML.bind(this), 1, this);
		this.API.addModifier('feedXmlOutput', this.modifyFeed.bind(this), 1, this);
		this.API.addModifier('feedJsonOutput', this.modifyFeed.bind(this), 1, this);
		this.API.addInsertion('customHeadCode', this.addStyles.bind(this), 1, this);
	}

	// Modify the XML/JSON feed output to include Feather icons.
	modifyFeed (rendererInstance, feedCode) {
		const iconRegex = /\[fi(?:-|&#x3D;|=)([^\s ]+?)(?:\s+size(?:-|&#x3D;|=)(\d+(?:.\d+)?)(px|em|rem|vw|vh|vmin|vmax)?)?(?:\s+color(?:-|&#x3D;|=)([#\w]+))?(?:\s+class(?:-|&#x3D;|=)([\w\s-_]+))?(?:\s+aria-hidden(?:-|&#x3D;|=)(true|false))?(?:\s+stroke-width(?:-|&#x3D;|=)(\d+(?:.\d+)?))?]/g;
		const defaultStrokeColor = this.config.iconStrokeColorOption === 'customColor' ? this.config.iconCustomStrokeColor : 'currentColor';
		const defaultIconSize = this.config.iconSize || '24';
		const defaultIconUnit = this.config.iconSizeUnit || 'px';
		const ariaHiddenDefault = this.config.ariaHiddenDefault === 'false' ? '' : ' aria-hidden="true"';
		const defaultStrokeWidth = this.config.iconStrokeWidth || '2';
		const featherIconBasePath = `${rendererInstance.siteConfig.domain}/media/plugins/featherIcons/feather-sprite.svg`;
		const isJsonFeed = feedCode.indexOf('https://jsonfeed.org/version/1') > -1;
	
		return feedCode.replace(iconRegex, (match, iconName, size, unit, color, additionalClasses, ariaHiddenOption, strokeWidth) => {
			const iconSize = size ? `${size}${unit || defaultIconUnit}` : `${defaultIconSize}${defaultIconUnit}`;
			const strokeColor = color ? color : defaultStrokeColor;
			additionalClasses = additionalClasses ? ` ${additionalClasses}` : '';
			const ariaHiddenAttr = ariaHiddenOption === 'true' ? ' aria-hidden="true"' : (ariaHiddenOption === 'false' ? '' : ariaHiddenDefault);
			const iconStrokeWidth = strokeWidth || defaultStrokeWidth;
			const iconLoadingMethod = this.config.iconLoadingMethod || 'external';

			let viewBoxAttribute = 'viewBox="0 0 24 24"'; // Default viewBox value
			
			const iconData = svgIconsData[iconName];
			if (iconData) {
				const viewBoxMatch = iconData.match(/viewBox="([^"]+)"/);
				if (viewBoxMatch) {
					viewBoxAttribute = `viewBox="${viewBoxMatch[1]}"`;
				}
			}

			// Always use internal icon loading in preview mode
			if (rendererInstance.previewMode || iconLoadingMethod === 'internal') {
				if (iconData) {
					let output = `<svg class="fi fi-${iconName}${additionalClasses}" width="${iconSize}" height="${iconSize}" fill="none" stroke="${strokeColor}" stroke-width="${iconStrokeWidth}"${ariaHiddenAttr} ${viewBoxAttribute}><g>${iconData}</g></svg>`;

					if (isJsonFeed) {
						output = output.replace(/\"/gmi, '\\"');
					}

					return output;
				}
			} else {
				let output = `<svg class="fi fi-${iconName}${additionalClasses}" width="${iconSize}" height="${iconSize}" fill="none" stroke="${strokeColor}" stroke-width="${iconStrokeWidth}"${ariaHiddenAttr} ${viewBoxAttribute}><use href="${featherIconBasePath}#${iconName}" /></svg>`;

				if (isJsonFeed) {
					output = output.replace(/\"/gmi, '\\"');
				}

				return output;
			}
		
			return match;
		});
	}

	// Modify the HTML output to include Feather icons.
	modifyHTML(rendererInstance, htmlCode) {
		const bodyRegex = /(<body[^>]*>)([\s\S]*?)(<\/body>)/i;
		const iconRegex = /\[fi(?:-|&#x3D;|=)([^\s ]+?)(?:\s+size(?:-|&#x3D;|=)(\d+(?:.\d+)?)(px|em|rem|vw|vh|vmin|vmax)?)?(?:\s+color(?:-|&#x3D;|=)([#\w]+))?(?:\s+class(?:-|&#x3D;|=)([\w\s-_]+))?(?:\s+aria-hidden(?:-|&#x3D;|=)(true|false))?(?:\s+stroke-width(?:-|&#x3D;|=)(\d+(?:.\d+)?))?]/g;
		const defaultStrokeColor = this.config.iconStrokeColorOption === 'customColor' ? this.config.iconCustomStrokeColor : 'currentColor';
		const defaultIconSize = this.config.iconSize || '24';
		const defaultIconUnit = this.config.iconSizeUnit || 'px';
		const ariaHiddenDefault = this.config.ariaHiddenDefault === 'false' ? '' : ' aria-hidden="true"';
		const defaultStrokeWidth = this.config.iconStrokeWidth || '2';
		const featherIconBasePath = `${rendererInstance.siteConfig.domain}/media/plugins/featherIcons/feather-sprite.svg`;
		const isPreviewMode = rendererInstance.previewMode || false;
		const previewModeScript = isPreviewMode ? `
            <script>
                (function() {
                    var svgItems = document.body.querySelectorAll('svg.fi');
                    var svgMap = ${JSON.stringify(svgIconsData)};

                    svgItems.forEach(function(svgItem) {
                        var iconName = svgItem.classList.contains('fi') && svgItem.classList[1].replace('fi-', '');
                        if (!iconName || !svgMap[iconName]) {
                            return;
                        }

                        var itemData = svgMap[iconName];

                        // Check if the SVG already has a viewBox attribute set
                        if (!svgItem.hasAttribute('viewBox')) {
                            var viewBoxMatch = itemData.match(/viewBox="([^"]+)"/);
                            var viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
                            svgItem.setAttribute('viewBox', viewBox);
                        }

                        svgItem.innerHTML = itemData;
                    });
                })();
            </script>` : '';

		if (bodyRegex.test(htmlCode)) {
			htmlCode = htmlCode.replace(bodyRegex, (match, startTag, bodyContent, endTag) => {
				return startTag + bodyContent.replace(iconRegex, (match, iconName, size, unit, color, additionalClasses, ariaHiddenOption, strokeWidth) => {
					const iconSize = size ? `${size}${unit || defaultIconUnit}` : `${defaultIconSize}${defaultIconUnit}`;
					const strokeColor = color ? color : defaultStrokeColor;
					additionalClasses = additionalClasses ? ` ${additionalClasses}` : '';
					const ariaHiddenAttr = ariaHiddenOption === 'true' ? ' aria-hidden="true"' : (ariaHiddenOption === 'false' ? '' : ariaHiddenDefault);
					const iconStrokeWidth = strokeWidth || defaultStrokeWidth;

					const iconLoadingMethod = this.config.iconLoadingMethod || 'external';

					let viewBoxAttribute = 'viewBox="0 0 24 24"'; // Default viewBox value
					
					const iconData = svgIconsData[iconName];
					if (iconData) {
						const viewBoxMatch = iconData.match(/viewBox="([^"]+)"/);
						if (viewBoxMatch) {
							viewBoxAttribute = `viewBox="${viewBoxMatch[1]}"`;
						}
					}

					// Always use internal icon loading in preview mode
					if (rendererInstance.previewMode || iconLoadingMethod === 'internal') {
						if (iconData) {
							return `<svg class="fi fi-${iconName}${additionalClasses}" width="${iconSize}" height="${iconSize}" fill="none" stroke="${strokeColor}" stroke-width="${iconStrokeWidth}"${ariaHiddenAttr} ${viewBoxAttribute}><g>${iconData}</g></svg>`;
						}
					} else {
						return `<svg class="fi fi-${iconName}${additionalClasses}" width="${iconSize}" height="${iconSize}" fill="none" stroke="${strokeColor}" stroke-width="${iconStrokeWidth}"${ariaHiddenAttr} ${viewBoxAttribute}><use href="${featherIconBasePath}#${iconName}" /></svg>`;
					}
				
					return match;
				}) + previewModeScript + endTag;
			});
		}

		return htmlCode;
	}

	// Inject CSS styles for icons
	addStyles() {
		const verticalAlign = this.config.iconVerticalAlign === 'length'
			? this.config.iconVerticalAlignCustom || 'middle'
			: this.config.iconVerticalAlign || 'middle';

		const nonScalingStrokeEnabled = this.config.nonScalingStroke;
		let additionalStyles = '';

		if (nonScalingStrokeEnabled) {
			additionalStyles = `.fi * {vector-effect: non-scaling-stroke; }`;
		}

		return `
           <style>.fi{fill:none;stroke-linecap:round;stroke-linejoin:round;vertical-align:${verticalAlign}}${additionalStyles}</style>`;
	}
}

module.exports = FeatherIcons;
