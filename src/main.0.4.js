define(function(require, exports, module) {
    var Engine              = require("famous/core/Engine");
    var View                = require('famous/core/View');
    var Surface             = require("famous/core/Surface");
    var ContainerSurface    = require("famous/surfaces/ContainerSurface");
    var ImageSurface        = require('famous/surfaces/ImageSurface');
    var HeaderFooterLayout  = require("famous/views/HeaderFooterLayout");
    var Scrollview          = require("famous/views/Scrollview");
    var Transform           = require('famous/core/Transform');
    var Modifier            = require('famous/core/Modifier');
    var StateModifier       = require('famous/modifiers/StateModifier');
    var Easing              = require('famous/transitions/Easing');

    var ContentData         = require('data/ContentData');

    function ContentView() {
        View.apply(this, arguments);

        _createLayout.call(this);
        _createHeaderAndFooter.call(this);
        _createBody.call(this);
    }

    ContentView.prototype = Object.create(View.prototype);
    ContentView.prototype.constructor = ContentView;

    var smallerDimension = (window.innerHeight - 150) > window.innerWidth ? window.innerWidth - 15 : (window.innerHeight - 150);
    var horizontalPositioningFactor = 0.87 * smallerDimension;

    function _createLayout() {
        this.layout = new HeaderFooterLayout({
            headerSize: 100,
            footerSize: 50
        });
        this.add(this.layout);
    }

    function _createHeaderAndFooter() {
        var headerSurface = new Surface({
            size: [undefined, 100],
            content: "<div class='title'>my picture journal</div><div class='subtitle'>-a photo journal timeline-</div>",
            classes: ["grey-bg", "header"],
            properties: {
                lineHeight: "100px",
                textAlign: "center",
                zIndex: '101'
            }
        });
        this.layout.header.add(headerSurface);
        var footerSurface = new Surface({
            size: [undefined, 50],
            content: "footer content",
            classes: ["grey-bg", "footer"],
            properties: {
                lineHeight: "50px",
                textAlign: "center",
                zIndex: '101'
            }
        });
        this.layout.footer.add(footerSurface);
    }
    
    function _createBody() {
        var bodySurface = new ContainerSurface({
            size: [undefined, undefined],
            classes: ["white-bg", "app-body"]
        });
        this.layout.content.add(bodySurface);
        
        // add timeline
        var positionModifier = new StateModifier({
            align: [0, 1],
            origin: [0, 0]
        });
        var shiftModifier = new StateModifier({
          transform: Transform.translate(0, -70, 0)
        });
        var timelineSurface = new Surface({
            size: [horizontalPositioningFactor * ContentData.length, 60],
            classes: ["timeline"],
            properties: {
                zIndex: '99'
            }
        });
        bodySurface.add(positionModifier).add(shiftModifier).add(timelineSurface);

        // add content items
        for (var i = 0; i < ContentData.length; i++) {
            _addItem(bodySurface, i, ContentData[i]); 
        }   
    }

    function _addItem(bodySurface, index, data) {
        var positionModifier = new StateModifier({
            align: [0, 0.3],
            origin: [0, 0.3]
        });
        var imageModifier = new StateModifier({
            align: [0.5, 0.5],
            origin: [0.5, 0.5]
        });
        var scaleModifier = new StateModifier({
            transform: Transform.scale(0.75, 0.75, 1)
        });
        var surface = new ContainerSurface({
            size: [0.9 * smallerDimension, 0.9 * smallerDimension],
            classes: ["item-preview"]
        });
        var photo = new ImageSurface({
            size: [0.89 * smallerDimension, 0.89 * smallerDimension],
            content: data.mainImage
        });
        surface.add(imageModifier).add(photo);
        var overlay = new Surface({
            size: [0.89 * smallerDimension, 0.89 * smallerDimension],
            classes: ["overlay"],
            properties: {
                zIndex: '102'
            }
        });
        var contentHTML = "<div class='content-title'>" + data.title + "</div><i>" + data.date + "</i><br><br>" + data.body;
        var content = new Surface({
            content: contentHTML,
            classes: ["content"],
            properties: {
                lineHeight: "120%",
                textAlign: "center",
                zIndex: '103'
            }
        });
        var overlayModifier = new StateModifier({
            opacity: 0,
            align: [0.5, 0.5],
            origin: [0.5, 0.5]
        });
        var contentModifier = new StateModifier({
            opacity: 0,
            transform: Transform.translate(0, 0, -100)
        });
        surface.add(overlayModifier).add(overlay);
        surface.add(contentModifier).add(content);
        surface.on('mouseenter', function() {
            overlayModifier.setOpacity(0.8, { duration: 500, curve: 'easeIn' });
            contentModifier.setOpacity(1, { duration: 500, curve: 'easeIn' });
            contentModifier.setTransform(Transform.translate(0, 0, 1));
        });
        surface.on('mouseleave', function() {
            overlayModifier.setOpacity(0, { duration: 500, curve: 'easeIn' });
            contentModifier.setOpacity(0, { duration: 500, curve: 'easeIn' });
            contentModifier.setTransform(Transform.translate(0, 0, -100));
        });
        surface.on('click', function() {
            if (overlayModifier.getOpacity() == 0) {
                overlayModifier.setOpacity(0.8, { duration: 500, curve: 'easeIn' });
                contentModifier.setOpacity(1, { duration: 500, curve: 'easeIn' });
                contentModifier.setTransform(Transform.translate(0, 0, 1));
            } else {
                overlayModifier.setOpacity(0, { duration: 500, curve: 'easeIn' });
                contentModifier.setOpacity(0, { duration: 500, curve: 'easeIn' });
                contentModifier.setTransform(Transform.translate(0, 0, -100));
            }
            alert(contentModifier.zIndex());
        });
        scaleModifier.setTransform(
            Transform.scale(.9, .9, 1),
            { duration : 1000, curve: Easing.outBack }
        );
        if (index > 0) {
            var shiftModifier = new StateModifier({
              transform: Transform.translate((horizontalPositioningFactor * index), 0, 0)
            });
            bodySurface.add(positionModifier).add(shiftModifier).add(scaleModifier).add(surface);
        } else {
            bodySurface.add(positionModifier).add(scaleModifier).add(surface);
        }
        // add date below
        var positionModifier = new StateModifier({
            align: [0, 1],
            origin: [0, 0]
        });
        var shiftModifier = new StateModifier({
          transform: Transform.translate((index > 0 ? (horizontalPositioningFactor * index) : 0) + 4, -22, 0)
        });
        var rotateModifier = new StateModifier({
          transform: Transform.rotateZ(Math.PI/-2)
        });
        var dateSurface = new Surface({
            content: data.date,
            size: [true, true],
            classes: ["date"],
            properties: {
                zIndex: '110'
            }
        });
        bodySurface.add(positionModifier).add(shiftModifier).add(rotateModifier).add(dateSurface);
    }

    Engine.setOptions({appMode: false});
    var context = Engine.createContext();
    var view = new ContentView();
    context.add(view);
});


