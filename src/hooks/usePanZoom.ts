import { useCallback, useEffect, useRef } from 'react';
import { Viewport, ViewportChangeEvent } from '../types/models';
import { useMapStore } from '../stores/mapStore';

interface UsePanZoomOptions {
  containerRef: React.RefObject<HTMLElement>;
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
  panSpeed?: number;
  doubleClickZoom?: boolean;
  wheelZoom?: boolean;
  pinchZoom?: boolean;
}

export const usePanZoom = ({
  containerRef,
  minZoom = 0.1,
  maxZoom = 5,
  zoomSpeed = 0.1,
  panSpeed = 1,
  doubleClickZoom = true,
  wheelZoom = true,
  pinchZoom = true
}: UsePanZoomOptions) => {
  const { viewport, updateViewport } = useMapStore();
  const isDragging = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });
  const lastPinchDistance = useRef(0);
  const lastPinchCenter = useRef({ x: 0, y: 0 });

  // Clamp zoom value within bounds
  const clampZoom = useCallback((zoom: number) => {
    return Math.max(minZoom, Math.min(maxZoom, zoom));
  }, [minZoom, maxZoom]);

  // Update viewport with clamped values
  const setViewport = useCallback((newViewport: Partial<Viewport>) => {
    const clampedViewport: Viewport = {
      x: newViewport.x ?? viewport.x,
      y: newViewport.y ?? viewport.y,
      zoom: clampZoom(newViewport.zoom ?? viewport.zoom),
      rotation: newViewport.rotation ?? viewport.rotation
    };

    updateViewport({ viewport: clampedViewport });
  }, [viewport, clampZoom, updateViewport]);

  // Zoom to a specific point
  const zoomToPoint = useCallback((point: { x: number; y: number }, zoom: number) => {
    const clampedZoom = clampZoom(zoom);
    const zoomFactor = clampedZoom / viewport.zoom;
    
    setViewport({
      x: point.x - (point.x - viewport.x) * zoomFactor,
      y: point.y - (point.y - viewport.y) * zoomFactor,
      zoom: clampedZoom
    });
  }, [viewport, clampZoom, setViewport]);

  // Fit to bounds
  const fitToBounds = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    const scaleX = containerWidth / bounds.width;
    const scaleY = containerHeight / bounds.height;
    const scale = Math.min(scaleX, scaleY) * 0.9; // 90% to add some padding

    const clampedScale = clampZoom(scale);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    setViewport({
      x: centerX - containerWidth / 2 / clampedScale,
      y: centerY - containerHeight / 2 / clampedScale,
      zoom: clampedScale
    });
  }, [containerRef, clampZoom, setViewport]);

  // Reset viewport to default
  const resetViewport = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1, rotation: 0 });
  }, [setViewport]);

  // Convert screen coordinates to world coordinates
  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    return {
      x: (screenX - viewport.x) / viewport.zoom,
      y: (screenY - viewport.y) / viewport.zoom
    };
  }, [viewport]);

  // Convert world coordinates to screen coordinates
  const worldToScreen = useCallback((worldX: number, worldY: number) => {
    return {
      x: worldX * viewport.zoom + viewport.x,
      y: worldY * viewport.zoom + viewport.y
    };
  }, [viewport]);

  // Handle mouse wheel zoom
  const handleWheel = useCallback((event: WheelEvent) => {
    if (!wheelZoom) return;

    event.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const zoomDelta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    const newZoom = clampZoom(viewport.zoom + zoomDelta);

    zoomToPoint({ x: mouseX, y: mouseY }, newZoom);
  }, [wheelZoom, zoomSpeed, viewport.zoom, clampZoom, zoomToPoint, containerRef]);

  // Handle mouse down for panning
  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (event.button !== 0) return; // Only left mouse button

    isDragging.current = true;
    lastPointerPos.current = { x: event.clientX, y: event.clientY };
    event.preventDefault();
  }, []);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = event.clientX - lastPointerPos.current.x;
    const deltaY = event.clientY - lastPointerPos.current.y;

    setViewport({
      x: viewport.x + deltaX * panSpeed,
      y: viewport.y + deltaY * panSpeed
    });

    lastPointerPos.current = { x: event.clientX, y: event.clientY };
  }, [isDragging, viewport, panSpeed, setViewport]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Handle double click zoom
  const handleDoubleClick = useCallback((event: MouseEvent) => {
    if (!doubleClickZoom) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const newZoom = viewport.zoom < 1 ? 1 : 2;

    zoomToPoint({ x: mouseX, y: mouseY }, newZoom);
  }, [doubleClickZoom, viewport.zoom, zoomToPoint, containerRef]);

  // Handle touch events for pinch zoom
  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );
      
      lastPinchDistance.current = distance;
      lastPinchCenter.current = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
    }
  }, []);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!pinchZoom || event.touches.length !== 2) return;

    event.preventDefault();
    
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    
    const distance = Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
    
    const scale = distance / lastPinchDistance.current;
    const newZoom = clampZoom(viewport.zoom * scale);
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = lastPinchCenter.current.x - rect.left;
      const centerY = lastPinchCenter.current.y - rect.top;
      
      zoomToPoint({ x: centerX, y: centerY }, newZoom);
    }
    
    lastPinchDistance.current = distance;
  }, [pinchZoom, viewport.zoom, clampZoom, zoomToPoint, containerRef]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse events
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('dblclick', handleDoubleClick);

    // Touch events
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('dblclick', handleDoubleClick);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [
    containerRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleDoubleClick,
    handleTouchStart,
    handleTouchMove
  ]);

  return {
    viewport,
    setViewport,
    zoomToPoint,
    fitToBounds,
    resetViewport,
    screenToWorld,
    worldToScreen,
    isDragging: isDragging.current
  };
};
