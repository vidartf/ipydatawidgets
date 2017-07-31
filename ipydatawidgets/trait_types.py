"""
Common trait types and helpers.
"""
from traitlets import TraitError, TraitType



class Validators(TraitType):
    """A base class for trait types """

    def __init__(self, **kwargs):
        super(Validators, self).__init__(**kwargs)
        self.validators = []

    def valid(self, *validators):
        """
        Register new trait validators

        Validators are functions that take two arguments.
         - The trait instance
         - The proposed value

        Validators return the (potentially modified) value, which is either
        assigned to the HasTraits attribute or input into the next validator.

        They are evaluated in the order in which they are provided to the `valid`
        function.

        Example
        -------

        .. code-block:: python
            # Test with a shape constraint
            def shape(*dimensions):
                def validator(trait, value):
                    if value.shape != dimensions:
                        raise TraitError('Expected an of shape %s and got and array with shape %s' % (dimensions, value.shape))
                    else:
                        return value
                return validator

            class Foo(HasTraits):
                bar = Array(np.identity(2)).valid(shape(2, 2))
            foo = Foo()

            foo.bar = [1, 2]  # Should raise a TraitError
        """
        self.validators.extend(validators)
        return self

    def validate(self, obj, value):
        """Validate the value against registered validators."""
        try:
            for validator in self.validators:
                value = validator(self, value)
            return value
        except (ValueError, TypeError) as e:
            raise TraitError(e)
