(function (namespace) {
	// set sticky module and directive
	angular.module(namespace, []).directive(namespace, function () {
		return {
			link: function (scope, angularElement, attrs) {
				var
				// get element
				element = angularElement[0],

				// get document
				document = element.ownerDocument,

				// get window
				window = document.defaultView,

				// get wrapper
				wrapper = document.createElement('span'),

				// cache style
				style = element.getAttribute('style'),

				// get options
				bottom = parseFloat(attrs[namespace + 'Bottom']),
				media = window.matchMedia(attrs[namespace + 'Media'] || 'all'),
				top = parseFloat(attrs[namespace + 'Top']),

				// initialize states
				activeBottom = false,
				activeTop = false,
				offset = {};

				// configure wrapper
				wrapper.className = 'is-' + namespace;

				// activate sticky
				function activate() {
					// get element computed style
					var
					computedStyle = getComputedStyle(element),
					position = activeTop ? 'top:' + top : 'bottom:' + bottom,
					parentNode = element.parentNode,
					nextSibling = element.nextSibling;

					// replace element with wrapper containing element
					wrapper.appendChild(element);

					if (parentNode) {
						parentNode.insertBefore(wrapper, nextSibling);
					}

					// style wrapper
					wrapper.setAttribute('style', 'display:' + computedStyle.display + ';height:' + element.offsetHeight + 'px;margin:' + computedStyle.margin + ';width:' + element.offsetWidth + 'px');

					// style element
					element.setAttribute('style', 'left:' + offset.left + 'px;margin:0;position:fixed;transition:none;' + position + 'px;width:' + computedStyle.width);
				}

				// deactivate sticky
				function deactivate() {
					var
					parentNode = wrapper.parentNode,
					nextSibling = wrapper.nextSibling;

					// replace wrapper with element
					parentNode.removeChild(wrapper);

					parentNode.insertBefore(element, nextSibling);

					// unstyle element
					if (style === null) {
						element.removeAttribute('style');
					} else {
						element.setAttribute('style', style);
					}

					// unstyle wrapper
					wrapper.removeAttribute('style');

					activeTop = activeBottom = false;
				}

				// window scroll listener
				function onscroll() {
					// if activated
					if (activeTop || activeBottom) {
						// get wrapper offset
						offset = wrapper.getBoundingClientRect();

						activeBottom = !isNaN(bottom) && offset.top > window.innerHeight - bottom - wrapper.offsetHeight;
						activeTop = !isNaN(top) && offset.top < top;

						// deactivate if wrapper is inside range
						if (!activeTop && !activeBottom) {
							deactivate();
						}
					}
					// if not activated
					else if (media.matches) {
						// get element offset
						offset = element.getBoundingClientRect();

						activeBottom = !isNaN(bottom) && offset.top > window.innerHeight - bottom - element.offsetHeight;
						activeTop = !isNaN(top) && offset.top < top;

						// activate if element is outside range
						if (activeTop || activeBottom) {
							activate();
						}
					}
				}

				// window resize listener
				function onresize() {
					// conditionally deactivate sticky
					if (activeTop || activeBottom) {
						deactivate();
					}

					// re-initialize sticky
					onscroll();
				}

				// destroy listener
				function ondestroy() {
					onresize();

					window.removeEventListener('scroll', onscroll);
					window.removeEventListener('resize', onresize);
				}

				// bind listeners
				window.addEventListener('scroll', onscroll);
				window.addEventListener('resize', onresize);

				scope.$on('$destroy', ondestroy);

				// initialize sticky
				onscroll();
			}
		};
	});
})('sticky');