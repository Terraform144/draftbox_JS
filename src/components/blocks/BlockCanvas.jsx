import React from 'react';
import BlockRow from './BlockRow';

export default function BlockCanvas({ list, containerUid, slot, blockOps, activeTarget, onSetActiveTarget, varListId }) {
  const isActive = activeTarget.uid === (containerUid || null) && activeTarget.slot === (slot || null);

  return (
    <div className={'block-canvas' + (isActive ? ' active-target' : '')}>
      {list.length === 0 && (
        <div className="block-canvas-empty">Vide — clique ici puis choisis un bloc dans la palette à gauche.</div>
      )}
      {list.map((block, i) => (
        <BlockRow
          key={block.uid}
          block={block}
          blockOps={blockOps}
          activeTarget={activeTarget}
          onSetActiveTarget={onSetActiveTarget}
          varListId={varListId}
          isFirst={i === 0}
          isLast={i === list.length - 1}
        />
      ))}
      <button
        type="button"
        className="block-canvas-target"
        onClick={() => onSetActiveTarget({ uid: containerUid || null, slot: slot || null })}
      >
        {isActive ? '🎯 Les nouveaux blocs arrivent ici' : '+ Ajouter ici'}
      </button>
    </div>
  );
}
