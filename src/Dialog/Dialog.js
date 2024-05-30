/*
 * File Name: Dialog.js
 * Author Name: William Alves Jardim
 * Author Email: williamalvesjardim@gmail.com
 * 
 * LICENSE: WilliamJardim/VisualComponents © 2024 by William Alves Jardim is licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/4.0/**
*/

function Dialog(config){
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
        }

        if( propsDict['height'] ){
            context.element.style.height = (typeof propsDict['height'] == 'number' ? String(propsDict['height'])+'px' : propsDict['height']);
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
        context.created = true;

        //Adiciona o dialog na pagina
        if( context.writeTo == 'body' ){
            document.body.appendChild(context.element);
        }else{
            document.getElementById(context.writeTo).appendChild(context.element);
        }

        //Adiciona os botoes da janela
        let closebutton = document.createElement('button');
        closebutton.dialogContext = context;
        closebutton.setAttribute('class', 'MyDialog-window-button MyDialog-window-button-close');
        closebutton.append( context.closeSimbol );
        closebutton.onclick = function(){
            this.dialogContext.destroy();
        }

        if( context.writeTo == 'body' ){
            document.body.querySelector('.MyDialog-header').appendChild( closebutton );
        }else{
            document.getElementById(context.writeTo).querySelector('.MyDialog-header').appendChild( closebutton );
        }

        //Estiliza
        setTimeout(function(){
            context._applyStylesToDialog(context.style);
        }, 50);
    }

    context.destroy = function(){
        if( context.element ){
            if( context.writeTo == 'body' ){
                document.body.removeChild(context.element);
            }else{
                document.getElementById(context.writeTo).removeChild(context.element);
            }
        }
    }

    context.setPosition = function(xPos, yPos, metric='px'){
        context.element.setAttribute('top', `${String(yPos)}${metric}`);
        context.element.setAttribute('left', `${String(xPos)}${metric}`)
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