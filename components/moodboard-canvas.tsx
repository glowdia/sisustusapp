"use client";

import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { type ReactNode, useEffect, useRef } from "react";
import { Circle, Group, Image as KonvaImage, Layer, Rect, Stage, Text, Transformer } from "react-konva";
import useImage from "use-image";
import type { CanvasColor, CanvasElement, CanvasImage, CanvasProduct, CanvasText, Product } from "@/lib/types";

const canvasSize = {
  width: 1190,
  height: 842,
};

const productCardPadding = 12;
const productTextAreaHeight = 186;

type ElementPatch = Partial<Pick<CanvasElement, "x" | "y" | "width" | "height">>;
type SelectionBox = {
  height: number;
  width: number;
  x: number;
  y: number;
};

function SelectableElement({
  children,
  isSelected,
  item,
  minHeight = 60,
  minWidth = 80,
  onDelete,
  onSelect,
  onUpdate,
  selectionBox,
  showDeleteButton = false,
}: {
  children: ReactNode;
  isSelected: boolean;
  item: CanvasElement;
  minHeight?: number;
  minWidth?: number;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: ElementPatch) => void;
  selectionBox?: SelectionBox;
  showDeleteButton?: boolean;
}) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (!isSelected || !transformerRef.current || !groupRef.current) {
      return;
    }

    transformerRef.current.nodes([groupRef.current]);
    transformerRef.current.forceUpdate();
    transformerRef.current.getLayer()?.batchDraw();
    const animationFrame = window.requestAnimationFrame(() => {
      transformerRef.current?.forceUpdate();
      transformerRef.current?.getLayer()?.batchDraw();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [isSelected, item.height, item.width, selectionBox]);

  function handleTransformEnd(event: KonvaEventObject<Event>) {
    const node = event.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    if (selectionBox) {
      const widthOffset = selectionBox.width - item.width;
      const heightOffset = selectionBox.height - item.height;
      const nextSelectionWidth = Math.max(minWidth + widthOffset, selectionBox.width * scaleX);
      const nextSelectionHeight = Math.max(minHeight + heightOffset, selectionBox.height * scaleY);

      node.scaleX(1);
      node.scaleY(1);
      onUpdate(item.id, {
        height: nextSelectionHeight - heightOffset,
        width: nextSelectionWidth - widthOffset,
        x: node.x(),
        y: node.y(),
      });
      return;
    }

    const nextWidth = Math.max(minWidth, item.width * scaleX);
    const nextHeight = Math.max(minHeight, item.height * scaleY);

    node.scaleX(1);
    node.scaleY(1);
    onUpdate(item.id, {
      height: nextHeight,
      width: nextWidth,
      x: node.x(),
      y: node.y(),
    });
  }

  return (
    <>
      <Group
        draggable
        onClick={() => onSelect(item.id)}
        onDragEnd={(event: KonvaEventObject<DragEvent>) => {
          onUpdate(item.id, {
            x: event.target.x(),
            y: event.target.y(),
          });
        }}
        onTap={() => onSelect(item.id)}
        onTransformEnd={handleTransformEnd}
        ref={groupRef}
        x={item.x}
        y={item.y}
      >
        {selectionBox ? (
          <Rect
            x={selectionBox.x}
            y={selectionBox.y}
            width={selectionBox.width}
            height={selectionBox.height}
            fill="rgba(0,0,0,0)"
            listening={false}
          />
        ) : null}
        {children}
        {showDeleteButton ? (
          <Group
            onClick={(event) => {
              event.cancelBubble = true;
              onDelete(item.id);
            }}
            onTap={(event) => {
              event.cancelBubble = true;
              onDelete(item.id);
            }}
            x={item.width - 18}
            y={18}
          >
            <Circle fill="#111111" radius={16} />
            <Text
              align="center"
              fill="#ffffff"
              fontFamily="Arial"
              fontSize={22}
              fontStyle="bold"
              height={32}
              offsetX={16}
              offsetY={16}
              text="×"
              verticalAlign="middle"
              width={32}
            />
          </Group>
        ) : null}
      </Group>
      {isSelected ? (
        <Transformer
          boundBoxFunc={(oldBox, newBox) => {
            const widthOffset = selectionBox ? selectionBox.width - item.width : 0;
            const heightOffset = selectionBox ? selectionBox.height - item.height : 0;

            if (newBox.width < minWidth + widthOffset || newBox.height < minHeight + heightOffset) {
              return oldBox;
            }

            return newBox;
          }}
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          ref={transformerRef}
          rotateEnabled={false}
        />
      ) : null}
    </>
  );
}

function ProductCanvasElement({
  isSelected,
  item,
  onDelete,
  onSelect,
  onUpdate,
  product,
}: {
  isSelected: boolean;
  item: CanvasProduct;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: ElementPatch) => void;
  product: Product | undefined;
}) {
  const [image] = useImage(product ? proxiedImageUrl(product.imageUrl) : "", "anonymous");
  const imageRect = image ? fitImageInsideBox(image.width, image.height, item.width, item.height) : null;
  const selectionBox = {
    height: item.height + productTextAreaHeight,
    width: item.width + productCardPadding * 2,
    x: -productCardPadding,
    y: -productCardPadding,
  };

  if (!product) {
    return null;
  }

  return (
    <SelectableElement
      isSelected={isSelected}
      item={item}
      minHeight={190}
      minWidth={220}
      onDelete={onDelete}
      onSelect={onSelect}
      onUpdate={onUpdate}
      selectionBox={selectionBox}
      showDeleteButton
    >
      <Rect
        x={selectionBox.x}
        y={selectionBox.y}
        width={selectionBox.width}
        height={item.height + productTextAreaHeight}
        fill="#ffffff"
        shadowColor="rgba(36,36,36,0.18)"
        shadowBlur={18}
        shadowOpacity={0.4}
        cornerRadius={2}
      />
      <Rect x={0} y={0} width={item.width} height={item.height} fill="#ffffff" />
      {imageRect ? (
        <KonvaImage
          image={image}
          x={imageRect.x}
          y={imageRect.y}
          width={imageRect.width}
          height={imageRect.height}
        />
      ) : null}
      <Text
        x={0}
        y={item.height + 16}
        width={item.width}
        text={product.name}
        fill="#242424"
        fontSize={16}
        fontStyle="bold"
        fontFamily="Arial"
        height={48}
        ellipsis
        lineHeight={1.18}
        wrap="word"
      />
      <Text
        x={0}
        y={item.height + 76}
        width={item.width}
        text={`Väri: ${product.color}`}
        fill="#515151"
        fontSize={13}
        fontFamily="Arial"
        height={18}
        ellipsis
      />
      <Text
        x={0}
        y={item.height + 100}
        width={item.width}
        text={product.priceText}
        fill="#242424"
        fontSize={15}
        fontStyle="bold"
        fontFamily="Arial"
        height={20}
        ellipsis
      />
      <Text
        x={0}
        y={item.height + 126}
        width={item.width}
        text={product.dimensionsText}
        fill="#515151"
        fontSize={12}
        fontFamily="Arial"
        height={36}
        ellipsis
        lineHeight={1.2}
        wrap="word"
      />
    </SelectableElement>
  );
}

function fitImageInsideBox(imageWidth: number, imageHeight: number, boxWidth: number, boxHeight: number) {
  if (imageWidth <= 0 || imageHeight <= 0 || boxWidth <= 0 || boxHeight <= 0) {
    return {
      height: boxHeight,
      width: boxWidth,
      x: 0,
      y: 0,
    };
  }

  const scale = Math.min(boxWidth / imageWidth, boxHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    height,
    width,
    x: (boxWidth - width) / 2,
    y: (boxHeight - height) / 2,
  };
}

function proxiedImageUrl(src: string) {
  const normalizedSrc = src.trim();

  if (!normalizedSrc.startsWith("http")) {
    return normalizedSrc;
  }

  return `/_next/image?url=${encodeURIComponent(normalizedSrc)}&w=1200&q=85`;
}

function TextCanvasElement({
  isSelected,
  item,
  onDelete,
  onSelect,
  onUpdate,
}: {
  isSelected: boolean;
  item: CanvasText;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: ElementPatch) => void;
}) {
  return (
    <SelectableElement isSelected={isSelected} item={item} minHeight={48} minWidth={120} onDelete={onDelete} onSelect={onSelect} onUpdate={onUpdate}>
      <Rect
        x={-10}
        y={-8}
        width={item.width + 20}
        height={item.height + 16}
        fill="rgba(255,255,255,0.78)"
        stroke={isSelected ? "#b68867" : "rgba(182,136,103,0.32)"}
        strokeWidth={1}
      />
      <Text
        x={0}
        y={0}
        width={item.width}
        height={item.height}
        text={item.text}
        fill={item.fill}
        fontSize={item.fontSize}
        fontFamily="Arial"
        lineHeight={1.22}
        verticalAlign="top"
      />
    </SelectableElement>
  );
}

function UploadedImageCanvasElement({
  isSelected,
  item,
  onDelete,
  onSelect,
  onUpdate,
}: {
  isSelected: boolean;
  item: CanvasImage;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: ElementPatch) => void;
}) {
  const [image] = useImage(item.src);

  return (
    <SelectableElement
      isSelected={isSelected}
      item={item}
      minHeight={90}
      minWidth={90}
      onDelete={onDelete}
      onSelect={onSelect}
      onUpdate={onUpdate}
      showDeleteButton
    >
      <Rect
        x={-8}
        y={-8}
        width={item.width + 16}
        height={item.height + 16}
        fill="#ffffff"
        shadowColor="rgba(36,36,36,0.16)"
        shadowBlur={14}
        shadowOpacity={0.35}
      />
      <KonvaImage image={image} x={0} y={0} width={item.width} height={item.height} />
    </SelectableElement>
  );
}

function ColorCanvasElement({
  isSelected,
  item,
  onDelete,
  onSelect,
  onUpdate,
}: {
  isSelected: boolean;
  item: CanvasColor;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: ElementPatch) => void;
}) {
  return (
    <SelectableElement isSelected={isSelected} item={item} minHeight={84} minWidth={150} onDelete={onDelete} onSelect={onSelect} onUpdate={onUpdate}>
      <Rect
        x={0}
        y={0}
        width={item.width}
        height={item.height}
        fill="#ffffff"
        stroke={isSelected ? "#b68867" : "#ded8ce"}
        strokeWidth={1}
        shadowColor="rgba(36,36,36,0.12)"
        shadowBlur={12}
        shadowOpacity={0.3}
      />
      <Rect x={12} y={12} width={item.width - 24} height={Math.max(34, item.height - 64)} fill={item.hex} />
      <Text x={12} y={item.height - 44} width={item.width - 24} text={item.label} fill="#515151" fontSize={13} fontFamily="Arial" />
      <Text
        x={12}
        y={item.height - 26}
        width={item.width - 24}
        text={`${item.code} ${item.name}`}
        fill="#242424"
        fontSize={16}
        fontStyle="bold"
        fontFamily="Arial"
      />
    </SelectableElement>
  );
}

export function MoodboardCanvas({
  activePageTitle,
  canvasElements,
  onCanvasClick,
  onElementDelete,
  onElementSelect,
  onElementUpdate,
  products,
  selectedElementId,
}: {
  activePageTitle: string;
  canvasElements: CanvasElement[];
  onCanvasClick: () => void;
  onElementDelete: (id: string) => void;
  onElementSelect: (id: string) => void;
  onElementUpdate: (id: string, patch: ElementPatch) => void;
  products: Product[];
  selectedElementId: string | null;
}) {
  return (
    <Stage
      height={canvasSize.height}
      onMouseDown={(event) => {
        if (event.target === event.target.getStage()) {
          onCanvasClick();
        }
      }}
      onTouchStart={(event) => {
        if (event.target === event.target.getStage()) {
          onCanvasClick();
        }
      }}
      width={canvasSize.width}
    >
      <Layer>
        <Rect
          x={0}
          y={0}
          width={canvasSize.width}
          height={canvasSize.height}
          fill="#fbfaf6"
          onClick={onCanvasClick}
          onTap={onCanvasClick}
        />
        <Rect x={54} y={54} width={1082} height={734} stroke="#d8d0c3" strokeWidth={2} />
        <Text
          x={84}
          y={78}
          text={activePageTitle.toUpperCase()}
          fontSize={34}
          fontFamily="Arial"
          letterSpacing={1}
          fill="#242424"
        />
        <Text
          x={86}
          y={124}
          width={470}
          text="Raahaa tuotteita tuotepankista sivulle ja viimeistele asiakkaalle ladattava moodboard."
          fontSize={18}
          lineHeight={1.35}
          fill="#515151"
        />
        {canvasElements.map((item) => {
          if (item.type === "product") {
            return (
              <ProductCanvasElement
                isSelected={item.id === selectedElementId}
                item={item}
                key={item.id}
                onDelete={onElementDelete}
                onSelect={onElementSelect}
                onUpdate={onElementUpdate}
                product={products.find((product) => product.id === item.productId)}
              />
            );
          }

          if (item.type === "text") {
            return (
              <TextCanvasElement
                isSelected={item.id === selectedElementId}
                item={item}
                key={item.id}
                onDelete={onElementDelete}
                onSelect={onElementSelect}
                onUpdate={onElementUpdate}
              />
            );
          }

          if (item.type === "image") {
            return (
              <UploadedImageCanvasElement
                isSelected={item.id === selectedElementId}
                item={item}
                key={item.id}
                onDelete={onElementDelete}
                onSelect={onElementSelect}
                onUpdate={onElementUpdate}
              />
            );
          }

          return (
            <ColorCanvasElement
              isSelected={item.id === selectedElementId}
              item={item}
              key={item.id}
              onDelete={onElementDelete}
              onSelect={onElementSelect}
              onUpdate={onElementUpdate}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}

export { canvasSize };
