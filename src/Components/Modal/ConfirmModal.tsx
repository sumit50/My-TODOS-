import Modal from "./Modal";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onCancel,
  onConfirm,
}: ConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>

      <p className="text-gray-600 mb-6">{message}</p>

      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 border rounded-lg">
          Cancel
        </button>

        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg">
          Confirm
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
