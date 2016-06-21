describe("Image", function() {

  var image;

  beforeEach(function() {

    loadFixtures('graph.html');

  });


  it("should not be undefined even if it has no graph or DOM element", function(done) {

    image = new SpectralWorkbench.Image(
      false,
      {
        onLoad: done // options
      }
    );

    expect(image).toBeDefined();

  });


  it("has defined width and height", function() {

    expect(image.width).toBeDefined();
    expect(image.height).toBeDefined();

    expect(image.width).toBe(800);

  });


  it("has a canvas element and context", function() {

    expect(image.canvasEl).toBeDefined();
    expect(image.canvasEl.length).toEqual(1);
    expect(image.canvasEl.width()).toEqual(image.width);
    expect(image.canvasEl.height()).toEqual(image.height);
    expect(image.ctx.canvas.width).toEqual(image.width);
    expect(image.ctx.canvas.height).toEqual(image.height);

  });


  it("can be constructed from an image url", function(done) {

    var imageFromUrl = new SpectralWorkbench.Image(false, {
      url: 'spec/javascripts/fixtures/test-spectrum-9.png',
      onLoad: function onLoad() {

        expect(imageFromUrl.obj).not.toBeUndefined();
        expect(imageFromUrl.width).not.toBeUndefined();

        done();

      }
    });

  });


});
