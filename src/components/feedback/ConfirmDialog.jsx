import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@heroui/react'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, body, confirmLabel = 'מחיקה', loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} placement="center" dir="rtl">
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody className="text-sm text-gray-600">{body}</ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onClose}>ביטול</Button>
          <Button color="danger" isLoading={loading} onPress={onConfirm}>{confirmLabel}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
