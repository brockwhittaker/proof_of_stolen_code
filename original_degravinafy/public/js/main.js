function ProfilePic () {
  var settings = {
    width: 500,
    height: 500,
    fileUploadDiv: _("#upload_file"),
    fileInput: _("#file_input"),
    downloadButton: _("#button")
  };

  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");

  canvas.width = settings.width * 2;
  canvas.style.width = settings.width + "px";

  canvas.height = settings.height * 2;
  canvas.style.height = settings.height + "px";

  var internal = {
    initEvents: function () {
      var $this = this;

      if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
        console.log(true);
        _("#warning").html("Right click to save the photo in Safari.");
      } else {
      }

      this.addDefault();

      settings.fileUploadDiv.on("click", function () {
        settings.fileInput.click();
      });

      settings.fileInput.on("change", function () {
        var file = this.files[0];

        if (file) {
          var reader = new FileReader();
          reader.onload = function (e) {
            var contents = e.target.result;
            $this.applyPhotos(file, contents);
          };
          reader.readAsDataURL(file);
        }
      });

      settings.downloadButton.on("click", function () {

      });
    },

    addDefault: function () {
      var img = new Image();

      img.src = "public/assets/facebookgeneric.jpg";

      img.onload = function () {
        context.drawImage(this, 0, 0, settings.width * 2, settings.height * 2);
      };
    },

    applyPhotos: function (info, file) {
      var img = new Image(),
          $this = this;

      img.src = file;

      function getOrientation (img) {
        return (img.naturalWidth >= img.naturalHeight) ? "landscape" : "portrait";
      }

      function calculateAdjustedDimensions (orientation, img) {
        var adj;

        if (getOrientation(img) == "landscape") {
          adj = {
            width: img.naturalWidth / (img.naturalHeight / 1000),
            height: 1000
          };

          adj.offset = -(adj.width - settings.height * 2) / 2;
        } else {
          adj = {
            width: 1000,
            height: img.naturalHeight / (img.naturalWidth / 1000)
          };

          adj.offset = -(adj.height - settings.width * 2) / 2;
        }

        return adj;
      }

      img.onload = function () {
        var orientation = getOrientation(this);

        adj = calculateAdjustedDimensions(orientation, this);

        context.clearRect(0, 0, settings.width * 2,  settings.height * 2);
        if (orientation == "landscape") {
          context.drawImage(this, adj.offset, 0, adj.width, adj.height);
        } else {
          context.drawImage(this, 0, adj.offset, adj.width, adj.height);
        }

        context.rect(0, 0, settings.width * 2, settings.height * 2);
        context.fillStyle = "rgba(0,0,0,0.2)";
        context.fill();

        $this.addFrame(function (frame) {
          context.drawImage(frame, 0, 0, 1000, 1000);
          var canvasData = canvas.toDataURL("image/jpeg");
          if (/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent)) {
            _("canvas").remove();
            _(".container").append(_.create({
              tagName: "img",
              className: "substitute-img",
              src: canvasData
            }));
            _("#warning").css("color", "#A14C4C");
          } else {
            _("#download_content").attr("href", canvasData.replace("image/jpeg", "image/octet-stream"));
            _("#button").css('display', 'inline-block');
          }
        });

      };
    },

    addFrame: function (callback) {
      var frame = new Image();
      frame.src = "public/assets/Frame.png";

      frame.onload = function () {
        callback(this);
      };
    }
  };

  internal.initEvents();

  return {
    getCanvas: function () {
      return canvas;
    }
  };
}

var profile = ProfilePic();
_(".container").append(profile.getCanvas());
