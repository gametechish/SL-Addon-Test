"""
Hello Starlight - Example Addon Backend

This module demonstrates how to create backend handlers for a Starlight addon. 
"""

import logging
from datetime import datetime
from aiohttp import web

logger = logging.getLogger(__name__)

# Addon context will be injected by the addon loader
addon_context = None


def set_context(context):
    """Called by addon loader to inject the addon context."""
    global addon_context
    addon_context = context
    logger.info("Hello Starlight addon context initialized")


# =============================================================================
# API Handlers
# =============================================================================

async def get_greeting(request: web.Request) -> web.Response:
    """
    Get the current greeting message.
    
    GET /api/addon/hello-starlight/greeting
    """
    try:
        # Read from addon's persistent data storage
        data = addon_context.read_data('settings. json') if addon_context else {}
        greeting = data.get('greeting', 'Hello, Starlight!')
        
        # Track view count
        stats = addon_context.read_data('stats.json') if addon_context else {}
        stats['view_count'] = stats.get('view_count', 0) + 1
        stats['last_viewed'] = datetime.now(). isoformat()
        if addon_context:
            addon_context.write_data('stats. json', stats)
        
        return web.json_response({
            'status': 'success',
            'greeting': greeting,
            'timestamp': datetime.now(). isoformat()
        })
    except Exception as e:
        logger.error(f"Error getting greeting: {e}")
        return web.json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)


async def set_greeting(request: web.Request) -> web.Response:
    """
    Set a custom greeting message.
    
    POST /api/addon/hello-starlight/greeting
    Body: {"greeting": "Custom greeting message"}
    """
    try:
        data = await request.json()
        new_greeting = data. get('greeting', '').strip()
        
        if not new_greeting:
            return web.json_response({
                'status': 'error',
                'message': 'Greeting cannot be empty'
            }, status=400)
        
        if len(new_greeting) > 200:
            return web.json_response({
                'status': 'error',
                'message': 'Greeting must be 200 characters or less'
            }, status=400)
        
        # Save to addon's data storage
        settings = addon_context. read_data('settings.json') if addon_context else {}
        settings['greeting'] = new_greeting
        settings['updated_at'] = datetime.now().isoformat()
        
        if addon_context:
            addon_context.write_data('settings.json', settings)
        
        logger.info(f"Greeting updated to: {new_greeting}")
        
        return web.json_response({
            'status': 'success',
            'message': 'Greeting updated successfully',
            'greeting': new_greeting
        })
    except Exception as e:
        logger.error(f"Error setting greeting: {e}")
        return web.json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)


async def get_stats(request: web.Request) -> web.Response:
    """
    Get addon usage statistics.
    
    GET /api/addon/hello-starlight/stats
    """
    try:
        stats = addon_context.read_data('stats.json') if addon_context else {}
        
        return web.json_response({
            'status': 'success',
            'stats': {
                'view_count': stats.get('view_count', 0),
                'last_viewed': stats.get('last_viewed'),
                'installed_at': stats.get('installed_at'),
                'enabled_count': stats.get('enabled_count', 0)
            }
        })
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return web. json_response({
            'status': 'error',
            'message': str(e)
        }, status=500)


# =============================================================================
# Lifecycle Hooks
# =============================================================================

async def on_install(context):
    """Called when the addon is first installed."""
    logger.info("Hello Starlight addon installed!")
    
    # Initialize default data
    context.write_data('settings.json', {
        'greeting': 'Hello, Starlight!',
        'created_at': datetime. now().isoformat()
    })
    
    context.write_data('stats.json', {
        'installed_at': datetime. now().isoformat(),
        'view_count': 0,
        'enabled_count': 0
    })
    
    return {'status': 'success', 'message': 'Hello Starlight installed successfully'}


async def on_enable(context):
    """Called when the addon is enabled."""
    logger. info("Hello Starlight addon enabled!")
    
    # Track enable count
    stats = context.read_data('stats.json') or {}
    stats['enabled_count'] = stats.get('enabled_count', 0) + 1
    stats['last_enabled'] = datetime.now().isoformat()
    context.write_data('stats.json', stats)
    
    return {'status': 'success'}


async def on_disable(context):
    """Called when the addon is disabled."""
    logger.info("Hello Starlight addon disabled!")
    
    stats = context.read_data('stats.json') or {}
    stats['last_disabled'] = datetime.now().isoformat()
    context.write_data('stats.json', stats)
    
    return {'status': 'success'}


async def on_uninstall(context):
    """Called when the addon is uninstalled."""
    logger. info("Hello Starlight addon uninstalling - goodbye!")
    # Data folder will be cleaned up automatically by the addon manager
    return {'status': 'success', 'message': 'Goodbye!'}