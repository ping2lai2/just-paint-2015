
var setColor = function(value, colorArr) {
                var color = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
                colorArr.r = parseInt(color[1], 16);
                colorArr.g = parseInt(color[2], 16);
                colorArr.b = parseInt(color[3], 16);
            };

var mydragg = function(){
                return {
                    move : function(divid,xpos,ypos){
                        divid.style.left = xpos + 'px';
                        divid.style.top = ypos + 'px';
                    },
                    startMoving : function(divid,container,evt){
                        divid = document.getElementById(divid);
                        var container = document.getElementById(container);
                        evt = evt || window.event;
                        var posX = evt.clientX,
                            posY = evt.clientY,
                        divTop = divid.style.top,
                        divLeft = divid.style.left,
                        thisWi = parseInt(divid.offsetWidth),
                        thisHe = parseInt(divid.offsetHeight),
                        conteinerWi = parseInt(container.offsetWidth),
                        conteinerHe = parseInt(container.offsetHeight);
                        divid.style.boxShadow = '0 0 10px 1px rgba(0,20,60,0.4)';
                        divTop = divTop.replace('px','');
                        divLeft = divLeft.replace('px','');
                        
                        var diffX = posX - divLeft,
                            diffY = posY - divTop;
                        document.onmousemove = function(evt){
                            evt = evt || window.event;
                            var posX = evt.clientX,
                                posY = evt.clientY,
                                aX = posX - diffX,
                                aY = posY - diffY;
                                if (aX < 0) aX = 0;
                                if (aY < 0) aY = 0;
                                if (aX + thisWi > conteinerWi){
                                    aX = conteinerWi - thisWi;
                                    if (aX < 0) aX = 0;
                                }
                                if (aY + thisHe > conteinerHe){
                                    aY = conteinerHe -thisHe;
                                     if (aY < 0) aY = 0;
                                }
                            mydragg.move(divid,aX,aY);
                        }
                    },
                    stopMoving : function(divid,container){
                        divid = document.getElementById(divid);
                        divid.style.boxShadow = '';
                        document.onmousemove = function(){}
                    },
                }
            }();

$(function(){
    var magicNumberTop = 42;
    var magicNumberLeft = 72;
    var subjectType = {};
    var save = document.getElementById("save");
    var canvas = document.getElementById("list2");
    var context = canvas.getContext('2d');
    var canvasCopy = document.getElementById("list1");
    var contextCopy = canvasCopy.getContext('2d');
    
    var widthCanvas = 480,
        heightCanvas = 720;
    

    var $wCanv = $('#wCanv');
    var $hCanv = $('#hCanv');

    $hCanv.val(heightCanvas);
    $wCanv.val(widthCanvas);
    

    canvasCopy.width = canvas.width = widthCanvas;
    canvasCopy.height = canvas.height = heightCanvas;
    contextCopy.lineWidth = context.lineWidth = 2;
    contextCopy.strokeStyle = context.strokeStyle = 'rgba(255,0,0,.4)';
    contextCopy.fillStyle = context.fillStyle = '#333';
    context.font = '14px Arial';
    contextCopy.lineJoin = context.lineJoin = 'round';
    contextCopy.lineCap = context.lineCap = 'round';

    var changeColorStroke = function(subj){
       context.strokeStyle =  contextCopy.strokeStyle = 'rgba('+subj.r+','+subj.g+','+subj.b+','+subj.a+')';
    };
    var changeColorFill = function(subj){
       context.fillStyle =  contextCopy.fillStyle = 'rgba('+subj.r+','+subj.g+','+subj.b+','+subj.a+')';
    };
    var changeSize = function(subj){
        contextCopy.lineWidth = context.lineWidth = subj.size;
    };
    var scrollWrap = document.querySelector('#inner');
    var curColor = {
            r:0,
            g:0,
            b:0,
            a:1
        },
        strokeColor = {
            r:0,
            g:60,
            b:120,
            a:0.5
        };
    
    var historyCanvas = (function(){
        var cache = new Array();
        var step = -1;
        
        
        function redraw(){  
            var render = new Image();
            render.src = cache[step];
            render.onload = function() {
                contextCopy.clearRect(0,0,widthCanvas,heightCanvas);
                contextCopy.drawImage(render, 0, 0);
            };   
        };
        function putIn(){
            step++;
            if (step < cache.length){
                cache.length = step;    
                    
            }
            cache.push(canvasCopy.toDataURL());
        };
        putIn();
        return{
            putIn : putIn,
            undoC : function(){
                if(step > 0) {
                    step--;
                    redraw();
                }
            },
            redoC : function(){
                if(step < cache.length-1) {
                    step++;
                    redraw();
                }
            },
            clearCache : function(){
                step = -1;
                cache = [];
            }
        }  
    })();
    
    $('#redo').on('click',function(){
        historyCanvas.redoC();
        
    });
    $('#undo').on('click',function(){
        historyCanvas.undoC();
        
    });
    
    
    var pencil = (function(){
        var isDraw = false;
        var path = [];
        
        function drawPath(context, permanent) {
            var l = path.length;
            if (!permanent) context.clearRect(0,0,widthCanvas,heightCanvas);
            context.beginPath();
            for (var i = 0; i < l; i++) {
                var p = path[i];
                if (i === 0) context.moveTo(p[0], p[1]);
                else context.lineTo(p[0], p[1]);
            }
            context.stroke();
        };
        return{
            size : 2,
            name:'pencil',
            init: function(){
                var that = this;
                var setngs = '<div class="col-row clearfix">\
                <span class="set-name">Карандаш:</span><div class="set-params clearfix">\
                                        <div class="param">\
                                            <span>Цвет:</span>\
                                            <div><div id="color-pencil" style="background:rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+');"></div>\
                                        </div></div>\
                                        <div class="param" id="opacity-pencil"><span>Непрозрачность:</span><input type="range" min="0" max="100" step="1" value="'+curColor.a*100+'"><input type="text" id="" min="0" max="100" value="'+curColor.a*100+'" maxlength="3"><span>%</span>\
                                        </div>\
                                        <div class="param" id="thickness-pencil">\
                                            <span>Толщина:</span>\
                                             <input type="range" min="2" max="80" step="1" value="'+that.size+'"><input type="text" maxlength="2" value="'+that.size+'"><span>px</span>\
                                        </div>\
                                    </div>\
                                </div>';
                $('#elems').html(setngs);
                var $colPal = $('#color-pencil');
                changeColorStroke(curColor);
                changeSize(that);
                $colPal.on('click',function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $('#palette1').click();
                });
                $('#opacity-pencil').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    curColor.a = $this.val()/100;
                    changeColorStroke(curColor);
                    $colPal.css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                });
                $('#thickness-pencil').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    that.size = $this.val();
                    changeSize(that);
                
                }); 
                
                $('#palette1').on('change',function(){
                    setColor($(this).val(), curColor);
                    changeColorStroke(curColor);
                    $colPal.css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                });  
            },
            pointer :{
                canvEvListeners : {
                    mM: function (e){
                        if (!isDraw){
                            return;
                        }
                        var coords = get_coords(e, canvas, scrollWrap);
                        path.push([coords.x,coords.y]);
                        drawPath(context);  
                    },
                    mL:function (e) {
                        if (!isDraw){
                            return;
                        }
                        drawPath(contextCopy, true);
                        isDraw = false;
                        context.clearRect(0,0,widthCanvas,heightCanvas);
                        historyCanvas.putIn();
                        
                    },
                    mD:function (e) {
                        if(e.which!=1){
                            return;
                        }
                        isDraw = true;
                        var coords = get_coords(e, canvas, scrollWrap);
                        path = [];
                        path.push([coords.x,coords.y]);
                    },
                    clear: function(){
                        $('#thickness-pencil').off();
                        $('#opacity-pencil').off();
                        $('#palette1').off('change');
                        $('#color-pencil').off('click');
                    }
                } 
            }
        }
    })();
    
    var floodfill = (function(){
        function floodFill(x, y){
            var imageData = contextCopy.getImageData(0, 0, widthCanvas, heightCanvas);
            var stack = [[x, y]];
            var pickColor = contextCopy.getImageData(x, y, 1, 1).data;  
            var oldColor = {
                r:pickColor[0],
                g:pickColor[1],
                b:pickColor[2],
                a:pickColor[3]
            };
            curColor.a = curColor.a*255;
            if (oldColor.r===curColor.r && oldColor.g===curColor.g && oldColor.b===curColor.b && oldColor.a===curColor.a){
                curColor.a = (curColor.a/255).toFixed(3);
                return false;
            }
            var newPos, x, y, pixelPos, reachLeft, reachRight;
            var drawingBoundTop = 0,
                drawingBoundLeft = 0,
                drawingBoundRight = widthCanvas-1,
                drawingBoundBottom = heightCanvas-1;
            while (stack.length)
            {  
                newPos = stack.pop();
                x = newPos[0];
                y = newPos[1];
                pixelPos = (y * widthCanvas + x) * 4;
                while(y >= drawingBoundTop && matchStartColor(imageData, pixelPos, oldColor, floodfill.limit)) {
                    y -= 1;
                    pixelPos -= widthCanvas * 4;
                }
                pixelPos += widthCanvas * 4;
                y += 1;
                reachLeft = false;
                reachRight = false;
                while (y <= drawingBoundBottom && matchStartColor(imageData, pixelPos, oldColor, floodfill.limit)) {
                    y += 1;
                    colorPixel(imageData, pixelPos);
                    if (x > drawingBoundLeft) {
                        if (matchStartColor(imageData, pixelPos - 4, oldColor, floodfill.limit)) {
                            if (!reachLeft) {
                                stack.push([x - 1, y]);
                                reachLeft = true;
                            }
                        } else if (reachLeft) {
                            reachLeft = false;
                        }
                    }
                    if (x < drawingBoundRight) {
                        if (matchStartColor(imageData, pixelPos + 4, oldColor, floodfill.limit)) {
                            if (!reachRight) {
                                stack.push([x + 1, y]);
                                reachRight = true;
                            }
                        } else if (reachRight) {
                            reachRight = false;
                        }
                    }
                    pixelPos += widthCanvas * 4;
                }            
            }
            contextCopy.putImageData(imageData, 0, 0);
            curColor.a = (curColor.a/255).toFixed(3);
        };
        Number.prototype.between  = function (a, b) {
            var min = Math.min.apply(Math, [a,b]),
                max = Math.max.apply(Math, [a,b]);
            return this > min && this < max;
        };
        function matchStartColor(imageData, pixelPos, oldColor, limit) {
            var r = imageData.data[pixelPos],	
                g = imageData.data[pixelPos+1],	
                b = imageData.data[pixelPos+2],
                a = imageData.data[pixelPos+3];
            if (r === oldColor.r && g === oldColor.g && b === oldColor.b && a>=oldColor.a-5 && a<=oldColor.a+5){
                return true;
            }
            if (r === curColor.r && g === curColor.g && b === curColor.b && a===curColor.a) {
                return false;
            }
           /* if (r.between(oldColor.r-limit, oldColor.r+limit) && g.between(oldColor.g-limit, oldColor.g+limit) && b.between(oldColor.b-limit, oldColor.b+limit) && a.between(oldColor.a-limit, oldColor.a+limit)){
                return true;
            }*/
            return (Math.abs(r - oldColor.r) + Math.abs(g - oldColor.g) + Math.abs(b - oldColor.b)+ Math.abs(a - oldColor.a) < 4*limit);
        };
        function colorPixel(imageData, pixelPos) {
            imageData.data[pixelPos] = curColor.r;
            imageData.data[pixelPos+1] = curColor.g;
            imageData.data[pixelPos+2] = curColor.b;
            imageData.data[pixelPos+3] = curColor.a;
        };
        return{
            name:'floodfill',
            limit : 1,
            init: function(){
                var that = this;
                var setngs = '<div class="col-row clearfix">\
                <span class="set-name">Заливка:</span><div class="set-params clearfix">\
                                        <div class="param">\
                                            <span>Цвет:</span>\
                                            <div><div id="color-floodfill" style="background:rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+');"></div>\
                                        </div></div>\
                                        <div class="param" id="opacity-floodfill"><span>Непрозрачность:</span><input type="range" min="0" max="100" step="1" value="'+curColor.a*100+'"><input type="text" id="" min="0" max="100" value="'+curColor.a*100+'" maxlength="3"><span>%</span>\
                                        </div>\
                                        <div class="param" id="limit-floodfill">\
                                            <span>Допуск:</span>\
                                             <input type="range" min="1" max="255" step="1" value="'+that.limit+'"><input type="text" maxlength="3" value="'+that.limit+'">\
                                        </div>\
                                    </div>\
                                </div>';
                $('#elems').html(setngs);
                changeColorStroke(curColor);
                $('#color-floodfill').on('click',function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $('#palette1').click();
                });
                $('#opacity-floodfill').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    curColor.a = $this.val()/100;
                    changeColorStroke(curColor);
                    $('#color-floodfill').css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                });
                $('#limit-floodfill').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    that.limit = $this.val();
                
                }); 
                
                $('#palette1').on('change',function(){
                    setColor($(this).val(), curColor);
                    changeColorStroke(curColor);
                    $('#color-floodfill').css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                });
                
            },
            pointer :{
                canvEvListeners : {
                    mM: function (e){
                        e.stopPropagation();
                        return;
                    },
                    mL:function (e) {
                        e.stopPropagation();
                        return;  
                    },
                    mD:function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        floodFill(e.offsetX, e.offsetY);
                        historyCanvas.putIn();

                    },
                    clear: function(){
                        $('#color-floodfill').off('click');
                        $('#opacity-floodfill').off();
                        $('#limit-floodfill').off();
                        $('#palette1').off('change');
                       
                    }
                } 
            } 
        }
        
    })();
    var pipette = (function(){
        function componentToHex(c) {
            var hex = c.toString(16);
            return hex.length == 1 ? "0" + hex : hex;
        };

        function rgbToHex(r, g, b) {
            return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
        };
        return{
            name : 'pipette',
            init : function(){  
                var setngs = '<div class="col-row pointer clearfix">\
                <span class="set-name">Пипетка:</span><div class="set-params change clearfix" id="cp1">\
                                        <div class="param">\
                                            <span>Цвет заливки:</span>\
                                            <div><div id="color-pipette1" style="background:rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+');"></div>\
                                        </div></div>\
                                        </div>\
                    <div class="set-params clearfix" id="cp2">\
                                        <div class="param">\
                                            <span>Цвет рамки:</span>\
                                            <div><div id="color-pipette2" style="background:rgba('+strokeColor.r+','+strokeColor.g+','+strokeColor.b+','+strokeColor.a+');"></div>\
                                        </div></div></div>\
                                </div>';
                $('#elems').html(setngs);
                changeColorStroke(curColor);
                $('#elems').on('click','.set-params',function(e){
                    e.preventDefault();
                    e.stopPropagation();
                    var $this = $(this);
                    if (!$this.hasClass('change')){
                        $this.addClass('change').siblings('div').removeClass('change');
                    }
                });
             },
            pointer :{
                canvEvListeners : {
                    mM: function (e){
                        e.stopPropagation();
                        return;
                    },
                    mL:function (e) {
                        e.stopPropagation();
                        return;  
                    },
                    mD:function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var pickColor = contextCopy.getImageData(e.offsetX, e.offsetY, 1, 1).data;  
                        var $elem = $('#elems').find('.change');
                        if($elem[0].id == 'cp1'){
                            curColor.r = pickColor[0];
                            curColor.g = pickColor[1];
                            curColor.b = pickColor[2];
                            curColor.a = (pickColor[3]/255).toFixed(3);
                            $('#color-pipette1').css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                            $('#palette1').val(rgbToHex(pickColor[0], pickColor[1], pickColor[2]));
                        }
                        else{
                            strokeColor.r = pickColor[0];
                            strokeColor.g = pickColor[1];
                            strokeColor.b = pickColor[2];
                            strokeColor.a = (pickColor[3]/255).toFixed(3);
                            $('#color-pipette2').css('background','rgba('+strokeColor.r+','+strokeColor.g+','+strokeColor.b+','+strokeColor.a+')');
                            $('#palette2').val(rgbToHex(pickColor[0], pickColor[1], pickColor[2]));
                        }

                    },
                    clear: function(){
                        $('#elems').off('click');
                    }
                } 
            }    
        }
         
     })();
    var eraser = (function(){
        var opacity = 1;
        return{
            isDraw : false,
            name : 'eraser',
            size : 2,
            init : function(){
                var that = this;
                var setngs = '<div class="col-row clearfix">\
                <span class="set-name">Ластик:</span><div class="set-params clearfix">\
                                        <div class="param" id="thickness-eraser">\
                                            <span>Толщина:</span>\
                                             <input type="range" min="2" max="80" step="1" value="'+that.size+'"><input type="text" maxlength="2" value="'+that.size+'"><span>px</span>\
                                        </div>\
                                    </div>\
                                </div>';
                $('#elems').html(setngs);
                changeSize(that);
                context.strokeStyle =  contextCopy.strokeStyle = 'rgba('+255+','+255+','+255+','+opacity+')';
                $('#thickness-eraser').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    that.size = $this.val();
                    changeSize(that);
                
                });
                
                
            },
            pointer :{
                canvEvListeners : {
                    clear: function(){
                        contextCopy.globalCompositeOperation="source-over";
                        $('#thickness-eraser').off();
                       
                    },
                    mM: function (e){
                        if (!eraser.isDraw){
                            return;
                        }
                        var coords = get_coords(e, canvasCopy, scrollWrap);
                        contextCopy.lineTo(coords.x, coords.y);
                        contextCopy.stroke();
                    },
                    mL:function (e) {
                        if (!eraser.isDraw){
                            return;
                        }
                        eraser.isDraw = false;
                        contextCopy.closePath();
                        contextCopy.globalCompositeOperation="source-over";
                        historyCanvas.putIn();
                        
                    },
                    mD:function (e) {
                        contextCopy.globalCompositeOperation="destination-out";
                        eraser.isDraw = true; 
                        contextCopy.beginPath();
                        var coords = get_coords(e, canvasCopy, scrollWrap);
                        contextCopy.moveTo(coords.x-0.1, coords.y);
                        contextCopy.lineTo(coords.x, coords.y);
                        contextCopy.closePath();
                        contextCopy.stroke(); 
                    }
                } 
            }
        }     
    })();
    
    
    
    var brush = (function(){
        function distanceBetween(point1, point2) {
            return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
        };
        function angleBetween(point1, point2) {
            return Math.atan2( point2.x - point1.x, point2.y - point1.y );
        };
        var isDrawing, lastPoint;
        var x,y;
        var view = {
                one : 1,
                two : 0.5
            };
        return{
            name : 'brush',
            size : 20,
            
            init : function(){
                var that = this;
                var setngs = '<div class="col-row clearfix">\
                                    <span class="set-name">Кисть:</span>\
                                    <div class="set-params clearfix">\
                                        <div class="param">\
                                            <span>Цвет:</span>\
                                            <div>\
                                                <div id="color-brush" style="background:rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+');"></div>\
                                            </div>\
                                        </div>\
                                        <div class="param" id="opacity-brush">\
                                            <span>Непрозрачность:</span>\
                                            <input type="range" min="0" max="100" step="1" value="'+curColor.a*100+'">\
                                            <input type="text" id="" min="0" max="100" value="'+curColor.a*100+'" maxlength="3">\
                                            <span>%</span>\
                                        </div>\
                                        <div class="param" id="thickness-brush">\
                                            <span>Размер:</span>\
                                            <input type="range" min="2" max="80" step="1" value="'+that.size+'">\
                                            <input type="text" maxlength="2" value="'+that.size+'">\
                                            <span>px</span>\
                                        </div>\
                                        <div class="brush-param" id="thickness-brush">\
                                            <span>Вид:</span>\
                                            <div id="scroll-brush" class="scroll-wrap">\
                                                <input id="rad-one" type="range" min="0" max="100" step="1" value="'+view.one*100+'">\
                                                <input id="rad-two" type="range" min="0" max="100" step="1" value="'+view.two*100+'">\
                                            </div>\
                                            <div class="view-wrap">\
                                                <div id="view-brush" style="width:'+that.size+'px; height:'+that.size+'px; border-radius:'+Math.ceil(that.size/2)+'px; background: radial-gradient(ellipse at center, rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a*view.one+') 0%,rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a*view.two+') 50%,rgba('+curColor.r+','+curColor.g+','+curColor.b+',0) 100%);"></div>\
                                            </div>\
                                        </div>\
                                    </div>\
                                </div>';
                $('#elems').html(setngs);
                var $colPal = $('#color-brush');
                var $viewBr = $('#view-brush');
                var cssGrad = function(){
                    $viewBr.css('background','radial-gradient(ellipse at center, rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a*view.one+') 0%,rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a*view.two+') 50%,rgba('+curColor.r+','+curColor.g+','+curColor.b+',0) 100%)');
                }
                
                $('#thickness-brush').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    that.size = $this.val();
                    changeSize(that);
                    $viewBr.css({width: that.size+'px',
                                 height: that.size+'px',
                                 'border-radius': Math.ceil(that.size/2)+'px'
                                });
                
                });
                $('#scroll-brush').on('input','input', function(e){
                    e.stopPropagation();
                    switch (this.id){
                        case 'rad-one': 
                            view.one = (this.value/100).toFixed(3);   
                            break
                        case 'rad-two':
                            view.two = (this.value/100).toFixed(3); 
                            break
                    }
                    cssGrad();
                    
                });
                $('#opacity-brush').on('input','input', function(e){
                     e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    curColor.a = $this.val()/100;
                    changeColorStroke(curColor);
                    $colPal.css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                    cssGrad();
                
                });
                $colPal.on('click',function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $('#palette1').click();
                });
                $('#palette1').on('change',function(){
                    setColor($(this).val(), curColor);
                    changeColorStroke(curColor);
                    $colPal.css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                    cssGrad();
        
                });
                
                
            },
            pointer :{
                canvEvListeners : {
                    clear: function(){
                        $('#thickness-brush').off();
                        $('#opacity-brush').off();
                        $('#palette1').off('change');
                        $('#color-brush').off('click');
                        $('#scroll-brush').off();
                    },
                    mM: function (e){
                        if (!isDrawing) return;
                        var currentPoint = get_coords(e, canvasCopy, scrollWrap);
                        var dist = distanceBetween(lastPoint, currentPoint);
                        var angle = angleBetween(lastPoint, currentPoint);

                        for (var i = 0; i < dist; i+=5) {
           
                            x = lastPoint.x + (Math.sin(angle) * i);
                            y = lastPoint.y + (Math.cos(angle) * i);
           
                            var radgrad = contextCopy.createRadialGradient(x,y,(brush.size/4).toFixed(5),x,y,(brush.size/2).toFixed(3));
    
                            radgrad.addColorStop(0, 'rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a*view.one+')');
                            radgrad.addColorStop(0.5, 'rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a*view.two+')');
                            radgrad.addColorStop(1, 'rgba('+curColor.r+','+curColor.g+','+curColor.b+',0)');
    
                            contextCopy.fillStyle = radgrad;
                            contextCopy.fillRect((x-brush.size/2).toFixed(5), (y-brush.size/2).toFixed(5), brush.size, brush.size);
                        }
                        lastPoint = currentPoint;
                        
                    },
                    mL:function (e) {
                        if (!isDrawing) return;
                        historyCanvas.putIn();
                        isDrawing = false;
                        
                    },
                    mD:function (e) {
                        isDrawing = true;
                        lastPoint = get_coords(e, canvasCopy, scrollWrap);
                    }
                } 
            }
        }  

    })();
    var rectangle = (function(){
        var isDrawing = false;
        var x0,y0;
        return{
            size: 2,
            name : 'rectangle',
            init: function(){
                var that = this;
                var setngs = '<div class="col-row clearfix">\
                <span class="set-name">Прямоугольник:</span><div class="set-params clearfix">\
                                        <div class="param">\
                                            <span>Заливка:</span>\
                                            <div><div id="fill-rectangle" style="background:rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+');"></div>\
                                        </div></div>\
                                        <div class="param" id="opacity-fill"><span>Непрозрачность:</span><input type="range" min="0" max="100" step="1" value="'+curColor.a*100+'"><input type="text" id="" min="0" max="100" value="'+curColor.a*100+'" maxlength="3"><span>%</span>\
                                        </div>\
                                    </div>\
                                    <div class="set-params clearfix">\
<div class="param">\
                                            <span>Рамка:</span>\
                                            <div><div id="stroke-rectangle" style="background:rgba('+strokeColor.r+','+strokeColor.g+','+strokeColor.b+','+strokeColor.a+');"></div>\
                                        </div></div>\
                                        <div class="param" id="opacity-stroke"><span>Непрозрачность:</span><input type="range" min="0" max="100" step="1" value="'+strokeColor.a*100+'"><input type="text" id="" min="0" max="100" value="'+strokeColor.a*100+'" maxlength="3"><span>%</span>\
                                        </div>\
                                        <div class="param" id="thickness-stroke">\
                                            <span>Толщина:</span>\
                                             <input type="range" min="1" max="40" step="1" value="'+that.size+'"><input type="text" maxlength="2" value="'+that.size+'"><span>px</span>\
                                        </div>\
</div>\
                                </div>';
                $('#elems').html(setngs);
                var $fillRect = $('#fill-rectangle');
                var $strokeRect = $('#stroke-rectangle');
                changeColorStroke(strokeColor);
                changeColorFill(curColor);
                changeSize(that);
                $fillRect.on('click',function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $('#palette1').click();
                });
                $strokeRect.on('click',function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $('#palette2').click();
                });
                $('#opacity-fill').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    curColor.a = $this.val()/100;
                    changeColorFill(curColor);
                    $fillRect.css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                });
                $('#opacity-stroke').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    strokeColor.a = $this.val()/100;
                    changeColorStroke(strokeColor);
                    $strokeRect.css('background','rgba('+strokeColor.r+','+strokeColor.g+','+strokeColor.b+','+strokeColor.a+')');
                });
                $('#thickness-stroke').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    that.size = $this.val();
                    changeSize(that);
                
                }); 
                $('#palette1').on('change',function(){
                    setColor($(this).val(), curColor);
                    changeColorFill(curColor);
                    $fillRect.css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                }); 
                $('#palette2').on('change',function(){
                    setColor($(this).val(), strokeColor);
                    changeColorStroke(strokeColor);
                    $strokeRect.css('background','rgba('+strokeColor.r+','+strokeColor.g+','+strokeColor.b+','+strokeColor.a+')');
                });
            },
            pointer :{
                canvEvListeners : {
                    clear: function(){
                        $('#thickness-stroke').off();
                        $('#opacity-fill').off();
                        $('#opacity-stroke').off();
                        $('#palette1').off('change');
                        $('#palette2').off('change');
                        $('#fill-rectangle').off('click');
                        $('#stroke-rectangle').off('click');
                    },
                    mM: function (e){
                        if (!isDrawing){
                            return;
                        }
                        var coords = get_coords(e, canvasCopy, scrollWrap);
                        var x = Math.min(coords.x, x0),
                            y = Math.min(coords.y, y0),
                            w = Math.abs(coords.x - x0),
                            h = Math.abs(coords.y - y0);
                        
                        context.clearRect(0, 0, widthCanvas, heightCanvas);
                        if (!w || !h) {
                            return;
                        }
                        context.beginPath();
                        context.rect(x, y, w, h);
                        context.stroke();
                        context.fill();
                    },
                    mL:function (e) {
                        if (!isDrawing){
                            return;
                        }
                        isDrawing = false;
                        contextCopy.drawImage(canvas, 0, 0);
                        context.beginPath();
                        context.clearRect(0, 0, widthCanvas, heightCanvas);
                        historyCanvas.putIn();
                        
                        
                        
                    },
                    mD:function (e) {
                        isDrawing = true; 
                        var coords = get_coords(e, canvasCopy, scrollWrap);
                        x0 = coords.x;
                        y0 = coords.y;
                    }
                } 
            }
        }     
    })();
    var circle = (function(){
        var isDrawing = false;
        var x0,y0;
        return{
            size: 2,
            name : 'circle',
            init: function(){
                var that = this;
                var setngs = '<div class="col-row clearfix">\
                <span class="set-name">Прямоугольник:</span><div class="set-params clearfix">\
                                        <div class="param">\
                                            <span>Заливка:</span>\
                                            <div><div id="fill-rectangle" style="background:rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+');"></div>\
                                        </div></div>\
                                        <div class="param" id="opacity-fill"><span>Непрозрачность:</span><input type="range" min="0" max="100" step="1" value="'+curColor.a*100+'"><input type="text" id="" min="0" max="100" value="'+curColor.a*100+'" maxlength="3"><span>%</span>\
                                        </div>\
                                    </div>\
                                    <div class="set-params clearfix">\
<div class="param">\
                                            <span>Рамка:</span>\
                                            <div><div id="stroke-rectangle" style="background:rgba('+strokeColor.r+','+strokeColor.g+','+strokeColor.b+','+strokeColor.a+');"></div>\
                                        </div></div>\
                                        <div class="param" id="opacity-stroke"><span>Непрозрачность:</span><input type="range" min="0" max="100" step="1" value="'+strokeColor.a*100+'"><input type="text" id="" min="0" max="100" value="'+strokeColor.a*100+'" maxlength="3"><span>%</span>\
                                        </div>\
                                        <div class="param" id="thickness-stroke">\
                                            <span>Толщина:</span>\
                                             <input type="range" min="1" max="40" step="1" value="'+that.size+'"><input type="text" maxlength="2" value="'+that.size+'"><span>px</span>\
                                        </div>\
</div>\
                                </div>';
                $('#elems').html(setngs);
                var $fillRect = $('#fill-rectangle');
                var $strokeRect = $('#stroke-rectangle');
                changeColorStroke(strokeColor);
                changeColorFill(curColor);
                changeSize(that);
                $fillRect.on('click',function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $('#palette1').click();
                });
                $strokeRect.on('click',function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $('#palette2').click();
                });
                $('#opacity-fill').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    curColor.a = $this.val()/100;
                    changeColorFill(curColor);
                    $fillRect.css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                });
                $('#opacity-stroke').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    strokeColor.a = $this.val()/100;
                    changeColorStroke(strokeColor);
                    $strokeRect.css('background','rgba('+strokeColor.r+','+strokeColor.g+','+strokeColor.b+','+strokeColor.a+')');
                });
                $('#thickness-stroke').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    that.size = $this.val();
                    changeSize(that);
                
                }); 
                $('#palette1').on('change',function(){
                    setColor($(this).val(), curColor);
                    changeColorFill(curColor);
                    $fillRect.css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                }); 
                $('#palette2').on('change',function(){
                    setColor($(this).val(), strokeColor);
                    changeColorStroke(strokeColor);
                    $strokeRect.css('background','rgba('+strokeColor.r+','+strokeColor.g+','+strokeColor.b+','+strokeColor.a+')');
                });
            },
            pointer :{
                canvEvListeners : {
                    clear: function(){
                        $('#thickness-stroke').off();
                        $('#opacity-fill').off();
                        $('#opacity-stroke').off();
                        $('#palette1').off('change');
                        $('#palette2').off('change');
                        $('#fill-rectangle').off('click');
                        $('#stroke-rectangle').off('click');
                    },
                    mM: function (e){
                        if (!isDrawing){
                            return;
                        }
                        var coords = get_coords(e, canvasCopy, scrollWrap);
                        var w = Math.abs(coords.x - x0),
                            h = Math.abs(coords.y - y0),
                            r = Math.max(w,h);
                        
                        context.clearRect(0, 0, widthCanvas, heightCanvas);
                        if (!w || !h) {
                            return;
                        }
                        context.beginPath();
                        context.arc(x0, y0, r, 0, 2*Math.PI, true);
                        context.stroke();
                        context.fill();
                    },
                    mL:function (e) {
                        if (!isDrawing){
                            return;
                        }
                        isDrawing = false;
                        contextCopy.drawImage(canvas, 0, 0);
                        context.beginPath();
                        context.clearRect(0, 0, widthCanvas, heightCanvas);
                        historyCanvas.putIn();
                    },
                    mD:function (e) {
                        isDrawing = true; 
                        var coords = get_coords(e, canvasCopy, scrollWrap);
                        x0 = coords.x;
                        y0 = coords.y;
                    }
                } 
            }
        }     
    })();
    var line = (function(){
        var isDrawing = false;
        var x0,y0;
        return{
            size : 2,
            name:'line',
            init: function(){
                var that = this;
                var setngs = '<div class="col-row clearfix">\
                <span class="set-name">Карандаш:</span><div class="set-params clearfix">\
                                        <div class="param">\
                                            <span>Цвет:</span>\
                                            <div><div id="color-pencil" style="background:rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+');"></div>\
                                        </div></div>\
                                        <div class="param" id="opacity-pencil"><span>Непрозрачность:</span><input type="range" min="0" max="100" step="1" value="'+curColor.a*100+'"><input type="text" id="" min="0" max="100" value="'+curColor.a*100+'" maxlength="3"><span>%</span>\
                                        </div>\
                                        <div class="param" id="thickness-pencil">\
                                            <span>Толщина:</span>\
                                             <input type="range" min="2" max="80" step="1" value="'+that.size+'"><input type="text" maxlength="2" value="'+that.size+'"><span>px</span>\
                                        </div>\
                                    </div>\
                                </div>';
                $('#elems').html(setngs);
                var $colPal = $('#color-pencil');
                changeColorStroke(curColor);
                changeSize(that);
                $colPal.on('click',function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $('#palette1').click();
                });
                $('#opacity-pencil').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    curColor.a = $this.val()/100;
                    changeColorStroke(curColor);
                    $colPal.css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                });
                $('#thickness-pencil').on('input','input', function(e){
                    e.stopPropagation();
                    var $this = $(this);
                    $this.siblings('input').val($this.val());
                    that.size = $this.val();
                    changeSize(that);
                
                }); 
                
                $('#palette1').on('change',function(){
                    setColor($(this).val(), curColor);
                    changeColorStroke(curColor);
                    $colPal.css('background','rgba('+curColor.r+','+curColor.g+','+curColor.b+','+curColor.a+')');
                });  
            },
            pointer :{
                canvEvListeners : {
                    mM: function (e){
                        if (!isDrawing){
                            return;
                        }
                        var coords = get_coords(e, canvasCopy, scrollWrap);
                        
                        
                        context.clearRect(0, 0, widthCanvas, heightCanvas);
                        
                        
                        context.beginPath();
                        context.moveTo(x0, y0); 
                        context.lineTo(coords.x, coords.y);
                        context.stroke();
                        context.closePath();
                    },
                    mL:function (e) {
                        if (!isDrawing){
                            return;
                        }
                        isDrawing = false;
                        contextCopy.drawImage(canvas, 0, 0);
                        context.beginPath();
                        context.clearRect(0, 0, widthCanvas, heightCanvas);
                        historyCanvas.putIn();
                    },
                    mD:function (e) {
                        isDrawing = true; 
                        var coords = get_coords(e, canvasCopy, scrollWrap);
                        x0 = coords.x;
                        y0 = coords.y;
                    },
                    clear: function(){
                        $('#thickness-pencil').off();
                        $('#opacity-pencil').off();
                        $('#palette1').off('change');
                        $('#color-pencil').off('click');
                    }
                } 
            }
        }
    })();
    
    var toggleTool = function(that, toolFunc){
         subjectType.clear();
        $('#'+subjectType.name).removeClass('active');
        $(that).addClass('active');
        toolFunc.init();
        subjectType = toolFunc.pointer.canvEvListeners;
        subjectType.name = toolFunc.name;
    };
    
    subjectType = pencil.pointer.canvEvListeners;
    subjectType.name = 'pencil';
    pencil.init();
    $('#pencil').addClass('active');
    
    $('#controls').on('click','>button',function(e){
        e.stopPropagation();
        e.preventDefault();
        switch (this.id){
            case 'floodfill':
                toggleTool(this, floodfill);
                break
            case 'pencil':
                toggleTool(this,pencil);
                break
            case 'pipette':
                toggleTool(this, pipette);
                break 
            case 'eraser':
                toggleTool(this,eraser);
                break
            case 'brush':
                toggleTool(this,brush);
                break
                
            case 'circle':
                toggleTool(this,circle);
                break
                
            case 'rectangle':
                toggleTool(this,rectangle);
                break
                
            case 'line':
                toggleTool(this,line);
                break    
        }

    });
   
    
    $(canvas).on({
        mousemove : function(e){
            subjectType.mM(e);
        },
        mouseleave : function (e) {
            subjectType.mL(e);
        },
        mouseup : function (e) {
            subjectType.mL(e);
        },
        mousedown : function (e) {
            subjectType.mD(e);
        } 
    });
     $('#close').on('click',function(){
         mainWindow.close();
    });

    $('#turn-up').on("click", function() {
  mainWindow.minimize();
});

    $(save).on('click',downloadCanvas);
    
    function downloadCanvas() {
        var fdialogs = require('node-webkit-fdialogs');
        var img = canvasCopy.toDataURL('image/png');
        var data = img.replace(/^data:image\/\w+;base64,/, "");
        var buf = new Buffer(data, 'base64');
         var saveDialog = new fdialogs.FDialog({
             // Тип диалога -> Сохранение файла
             type: 'save',
             // Доступные расширения -> .md
             accept: ['.png']
         });
        saveDialog.saveFile(buf, 'utf-8', function(err, filepath) {
        });
        
    };
    
              
    function get_coords(event, elem, scrollWrap) {
        var x = event.pageX - elem.offsetLeft-magicNumberLeft+scrollWrap.scrollLeft;
        var y = event.pageY - elem.offsetTop-magicNumberTop+scrollWrap.scrollTop;
        return {x : x, y : y};
    };
   
    var closeOutTarget = function(onTarget,func){
        $(document).on('mousedown.out',function(event) {
            if ($(event.target).closest(onTarget).length){
                return false;
            }
            func();
            $(document).off('mousedown.out');
            
        });
    };

    
    $('#menu').on('click',function(e){
        e.stopPropagation();
        var menu = this.nextElementSibling;
        var $this = $(this);
        if (menu.style.display ==='none'){

            $this.addClass('activeM');
            menu.style.display = 'block';
            $('#canopy').show();
            $('#canopy').on('mousedown.out',function(e){
                e.stopImmediatePropagation(); 
                e.preventDefault();
                menu.style.display = 'none';
                $this.removeClass('activeM');
                $(this).off('mousedown.out').hide();
            });
        }
        else{
            $this.removeClass('activeM');
            menu.style.display = 'none';
            $('#canopy').off('mousedown.out').hide();
        }
    });

    $('#add').on('click',function(ev){
        ev.preventDefault();
        ev.stopImmediatePropagation();
        var $canv = $('#list1, #list2')
        $canv.attr('height',$hCanv.val());
        $canv.attr('width',$wCanv.val());
        $('#list1').css('margin-left','-'+$wCanv.val()/2+'px');
        widthCanvas = $wCanv.val();
        heightCanvas = $hCanv.val();
        canvasCopy.width = canvas.width = widthCanvas;
        canvasCopy.height = canvas.height = heightCanvas;
        toggleTool($('#pencil')[0],pencil);
        context.clearRect(0, 0, widthCanvas, heightCanvas);
        contextCopy.clearRect(0, 0, widthCanvas, heightCanvas);
        contextCopy.lineJoin = context.lineJoin = 'round';
        contextCopy.lineCap = context.lineCap = 'round';
        historyCanvas.clearCache();
        historyCanvas.putIn();
    });
});