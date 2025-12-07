"""
Starlight Test Addon - Backend Handlers

This module provides the backend functionality for the test addon,
including API endpoints and lifecycle hooks.
"""

import json
import logging
from datetime import datetime
from aiohttp import web

logger = logging.getLogger(__name__)

# Global context reference (set by AddonLoader)
_context = None


def set_context(context):
    """
    Set the addon context.
    Called by AddonLoader when the module is loaded.
    
    Args:
        context: AddonContext instance
    """
    global _context
    _context = context
    logger.info(f"Context set for addon: {context.addon_id}")


# ============================================================================
# API Handlers
# ============================================================================

async def get_status(request):
    """
    Get the current status of the test addon.
    
    Returns:
        JSON response with addon status information
    """
    # Load stored data if available
    stats = {}
    if _context:
        stats = _context.load_data('stats.json', default={
            'enable_count': 0,
            'disable_count': 0,
            'last_enabled': None
        })
    
    return web.json_response({
        'status': 'success',
        'data': {
            'addon_id': 'starlight-test-addon',
            'version': '1.0.0',
            'healthy': True,
            'timestamp': datetime.now().isoformat(),
            'message': 'Starlight Test Addon is running correctly! ',
            'statistics': stats
        }
    })


async def ping(request):
    """
    Simple ping endpoint to test connectivity.
    
    Returns:
        JSON response with pong message
    """
    return web.json_response({
        'status': 'success',
        'data': {
            'message': 'pong',
            'timestamp': datetime.now().isoformat()
        }
    })


async def echo(request):
    """
    Echo back any data sent in the request body.
    
    Returns:
        JSON response with echoed data
    """
    try:
        body = await request.json()
    except json.JSONDecodeError:
        return web.json_response({
            'status': 'error',
            'message': 'Invalid JSON in request body'
        }, status=400)
    
    return web.json_response({
        'status': 'success',
        'data': {
            'echoed': body,
            'timestamp': datetime.now().isoformat()
        }
    })


# ============================================================================
# Lifecycle Hooks
# ============================================================================

def on_install(context):
    """
    Called when the addon is installed.
    
    Args:
        context: AddonContext instance
    """
    context.log_info("Starlight Test Addon installed successfully")
    
    # Initialize addon data
    context.save_data('stats.json', {
        'enable_count': 0,
        'disable_count': 0,
        'install_date': datetime.now().isoformat(),
        'last_enabled': None
    })
    
    context.log_info("Initial data saved to stats.json")


def on_uninstall(context):
    """
    Called when the addon is uninstalled.
    
    Args:
        context: AddonContext instance
    """
    context.log_info("Starlight Test Addon uninstalling...")
    
    # Clean up addon data
    context.delete_data('stats.json')
    
    context.log_info("Starlight Test Addon uninstalled and data cleaned up")


def on_enable(context):
    """
    Called when the addon is enabled.
    
    Args:
        context: AddonContext instance
    """
    context.log_info("Starlight Test Addon enabled")
    
    # Update enable statistics
    stats = context.load_data('stats.json', default={
        'enable_count': 0,
        'disable_count': 0
    })
    stats['enable_count'] = stats.get('enable_count', 0) + 1
    stats['last_enabled'] = datetime.now().isoformat()
    context.save_data('stats.json', stats)
    
    context.log_info(f"Enable count updated to {stats['enable_count']}")


def on_disable(context):
    """
    Called when the addon is disabled.
    
    Args:
        context: AddonContext instance
    """
    context.log_info("Starlight Test Addon disabled")
    
    # Update disable statistics
    stats = context.load_data('stats.json', default={
        'enable_count': 0,
        'disable_count': 0
    })
    stats['disable_count'] = stats.get('disable_count', 0) + 1
    stats['last_disabled'] = datetime.now().isoformat()
    context.save_data('stats.json', stats)
    
    context.log_info(f"Disable count updated to {stats['disable_count']}")