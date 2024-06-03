/*
 * File Name: Dialog.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/VisualComponents © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/

if( !globalThis.MyDialogs ){
    globalThis.MyDialogs = {};
}

globalThis.MyDialogs.Dialog = function Dialog(config){
    const context = AbstractClass(config);
    context._config = config;
    context.id = config['id'] || ('dialog-' + String(new Date().getTime()));
    context.objectName = 'Dialog';
    context.extendedFrom = 'AbstractClass';
    context.writeTo = config['writeTo'] || 'body';
    context.created = false;
    context.element = null;
    context.isVisible = false;
    context._defaultRootClass = 'MyDialog-Dialog';
    context.autoCreate = config['autoCreate'] || true;
    context.style = config['style'] || {};
    context.closeSimbol = 'X';
    context.maximizeminimizeSimbol = '[]';
    context.isMovendoJanela = false;
    context._mouseInfo = {};
    context.updateThreadInterval = 50;
    context.moveholdtime = 200;
    context.isFullScreen = false;
    context.defaultDialogWidth = 600;
    context.defaultDialogHeight = 400;

    context.allowClose = config['allowClose'] || true;
    context.allowMinimize = config['allowMinimize'] || true;
    context.allowResize = config['allowResize'] || true;

    context.title = config['title'];
    context.subtitle = config['subtitle'];
    
    context.defaultButtons = config['defaultButtons'] || {
        //Exemplo de defaultButtons com dois botoes padrao
        'yes': function(){

        },
        'no': function(){

        },
        'ok': function(){

        },
        'cancel': function(){

        }
    };

    context.customHTML = config['html']; //Caso o usuario queira passar um HTML diretamente
    context.callbacks = config['events']; //Callbacks dos eventos

    //Aplica estilos CSS dentro do proprio Dialog
    context._applyStylesToDialog = function(propsDict){
        if( !context.element ){ return };

        Object.keys(context.style).forEach(function(propName){
            context.element.style[propName] = context.style[propName];
        });

        //Se tiver cssClass, tenta aplicar
        if( propsDict['cssClass'] && !context.element.className.includes( propsDict['cssClass'] ) ){
            context.element.className += ` ${propsDict['cssClass']}`;
        }

        if( propsDict['width'] ){
            context.element.style.width = (typeof propsDict['width'] == 'number' ? String(propsDict['width'])+'px' : propsDict['width']);
        }else{
            context.element.style.width = String(context.defaultDialogWidth) + 'px';
            context.width = context.defaultDialogWidth;
        }

        if( propsDict['height'] ){
            context.element.style.height = (typeof propsDict['height'] == 'number' ? String(propsDict['height'])+'px' : propsDict['height']);
        }else{
            context.element.style.height = String(context.defaultDialogHeight) + 'px';
            context.height = context.defaultDialogHeight;
        }
    }

    //Cria o elemento principal
    context.createWindow = function(){
        context.element = document.createElement('div');
        context.element.setAttribute('id', context.id);
        context.titleElement = context.title ? `<h3 class='MyDialog-title'> ${context.title} </h3>` : '';

        context.element.innerHTML = `
            <div class='MyDialog-header' >
                ${ context.title ?  context.titleElement : '' }
            </div>

            <div class='MyDialog-body' >
                ${ context.customHTML ? context.customHTML : '' }
            </div>
        `;  

        context.element.setAttribute('class', context._defaultRootClass);

        //Adiciona o dialog na pagina
        if( context.writeTo == 'body' ){
            document.body.appendChild(context.element);
        }else{
            document.getElementById(context.writeTo).appendChild(context.element);
        }

        //Obtem o headerHtmlElement
        context.headerHtmlElement = undefined;
        if( context.writeTo == 'body' ){
            context.headerHtmlElement = document.body.querySelector('.MyDialog-header');
        }else{
            context.headerHtmlElement = document.getElementById(context.writeTo).querySelector('.MyDialog-header');
        }

        //Adiciona os botoes da janela
        context.addHeaderButtons();

        //Eventos da janela
        context.addHeaderButtonsEvents();

        context.created = true;

        //Estiliza
        setTimeout(function(){
            context._applyStylesToDialog(context.style);
        }, 50);
    }

    context.addHeaderButtons = function(){
        //Adiciona os botoes da janela
        let maximizeminimizebutton = document.createElement('button');
        maximizeminimizebutton.dialogContext = context;
        maximizeminimizebutton.setAttribute('class', 'MyDialog-window-button MyDialog-window-button-move');
        maximizeminimizebutton.append( context.maximizeminimizeSimbol );
        maximizeminimizebutton.onclick = function(){
            context.toggleFullScreen();
        }
        context.headerHtmlElement.appendChild( maximizeminimizebutton );

        let closebutton = document.createElement('button');
        closebutton.dialogContext = context;
        closebutton.setAttribute('class', 'MyDialog-window-button MyDialog-window-button-close');
        closebutton.append( context.closeSimbol );
        closebutton.onclick = function(){
            this.dialogContext.destroy();
        }
        context.headerHtmlElement.appendChild( closebutton );
    }

    context.addHeaderButtonsEvents = function(){
        //Eventos da janela
        context.element.addEventListener('mousedown', function(evento){
            context._mouseInfo['clicando'] = true;
            setTimeout( ()=>{
                if(context._mouseInfo['clicando'] && !context.isFullScreen){
                    context.isMovendoJanela = true;
                }
            }, context.moveholdtime );
        });
        context.element.addEventListener('mouseup', function(evento){
            context.isMovendoJanela = false;
            context._mouseInfo['clicando'] = false;
        });
        //Injeta uma função no window pra monitorar o mouse
        window.addEventListener('mousemove', function(evento){
            context._mouseInfo['x'] = evento.clientX;
            context._mouseInfo['y'] = evento.clientY;
        });
        window.addEventListener('mouseup', function(evento){
            context._mouseInfo['clicando'] = false;
            context.isMovendoJanela = false;
        });

        //Mover a janela
        if(!context.created){
            context.updateThreadId = setInterval( function(){
                if( context.isMovendoJanela == true ){
                    context.setPosition(`${context._mouseInfo['x']-parseInt((context.width/2) || 100) }`, `${context._mouseInfo['y']-parseInt((context.height/2) || 100)}`, 'px');
                }

                //Mantem o dialog dentro da janela do navegador
                const posicaoAtualDialog = context.getPosition();
                context.posicaoAtualDialog = posicaoAtualDialog;
                if( posicaoAtualDialog[0] >= window.innerWidth-parseInt(context.width || 100) ){
                    context.setX( window.innerWidth-parseInt(context.width || 100) );
                }
                if( posicaoAtualDialog[1] >= window.innerHeight-parseInt(context.height || 100) ){
                    context.setY( window.innerHeight-parseInt(context.height || 100) );
                } 

            }, context.updateThreadInterval);
        }
    }

    context.destroy = function(){
        if( context.element ){
            if( context.writeTo == 'body' ){
                document.body.removeChild(context.element);
            }else{
                document.getElementById(context.writeTo).removeChild(context.element);
            }
        }

        if( context.updateThreadId ){
            clearInterval(context.updateThreadId);
        }
    }

    context.toggleFullScreen = function(){
        if( !context.isFullScreen ){
            context.oldWidth = context.element.style.width || context.width || context.defaultDialogWidth;
            context.oldHeight = context.element.style.height || context.height || context.defaultDialogHeight;
            context.oldX = context.getPosition()[0];
            context.oldY = context.getPosition()[1];

            context.setResolution( window.innerWidth-50, window.innerHeight-50, 'px' );
            context.setPosition(0,0, 'px');
            context.isFullScreen = true;
        }else{
            context.setResolution( parseInt(context.oldWidth), parseInt(context.oldHeight), 'px' );
            context.setPosition( parseInt(context.oldX), parseInt(context.oldY), 'px');
            context.isFullScreen = false;
        }
    }

    context.setResolution = function(width, height, metric='px'){
        context.width = parseInt(width);
        context.element.style['width'] = `${parseInt(width)}${metric}`;
        context.height = parseInt(height);
        context.element.style['height'] = `${parseInt(height)}${metric}`;
    }

    context.setPosition = function(xPos, yPos, metric='px'){
        context.element.style['top'] = `${String(parseInt(yPos))}${metric}`;
        context.element.style['left'] = `${String(parseInt(xPos))}${metric}`;
    }

    context.setX = function(xPos, metric='px'){
        context.setPosition( xPos, context.getPosition()[1], metric );
    }

    context.setY = function(yPos, metric='px'){
        context.setPosition( context.getPosition()[0], yPos, metric );
    }

    context.getPosition = function(){
        return [ Number.parseInt(context.element.getAttribute('left')), Number.parseInt(context.element.getAttribute('top')) ];
    }

    context.show = function(){
        context.element.style.visibility = 'visible';
        context.element.style.display = 'block';
        context.isVisible = true;
    }

    context.hide = function(){
        context.element.style.visibility = 'hidden';
        context.element.style.display = 'none';
        context.isVisible = false;
    }

    //Se for para criar automaticamente apos ser instanciado
    if( context.autoCreate == true ){
        context.createWindow();
    }

    return context;

}